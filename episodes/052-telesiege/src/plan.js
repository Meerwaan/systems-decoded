// DOSSIER 052 — Télésiège débrayable : WHERE EVERYTHING STANDS. Centimetres, y up. No import: model.js, gare.js,
// ligne.js and world.js all read it; a number changes HERE, never in a set.
//
// AXES (true scale; nothing displayed is a size):
//   y 0      the station's floor (the quay). The cable runs at CABLE_Y in the station.
//   x        along the line: the line leaves the station toward +x and climbs; the bullwheel is at the back, −x.
//   z        across: the ARRIVAL side is z = −SIDE (chairs come down the line and move toward −x), the DEPARTURE side
//            (the quay where you board) is z = +SIDE (chairs move toward +x, out to the line).
// AZIMUTH (kit/lib/stage.js: camera = target + d·(sin az·cos el, sin el, cos az·cos el)):
//   az 0 the camera stands on +z (the departure side, outside it) · az −90 on −x (behind the bullwheel, looking up
//   the line) · az 90 on +x (out on the line, looking into the station) · az ±180 on −z (outside the arrival side).
//   The key light comes from −x, +y, +z: az between −20 and −80 is lit from the front.
//
// THE GRIP FRAME (model.js draws the grip in it, ligne.js mounts it on the chair): origin on the cable's axis when
// the grip is CLOSED on it; x the way the chair travels; y up; z OUTWARD (away from the bullwheel's centre: −z world on
// the arrival side, +z world on the departure side). pathAt() hands the yaw that maps it into the world.
//
// THE PATH (one curvilinear abscissa `s`, cm, for the hero chair and every other chair):
//   s < 0                 the arrival line, −s cm out from the station mouth, up the line (chairs come down it)
//   0 → A                 the arrival straight, x 1500 → −900 at z −SIDE (the opening came, the slowing tyres)
//   A → C0                the half turn round the bullwheel, behind it (x < −900)
//   C0 → END              the departure straight, x −900 → 1500 at z +SIDE (the quay, the launching tyres, the
//                         closing came, the weighing, the exit)
//   s > END               the departure line, s − END cm out of the station mouth, up the line
// `speedAt(s)` is the chair's speed there as a fraction of the cable's (the tyres' gradient): 1 on the line, 0.2 at
// the quay. The acts drive `chair` and `rope` (world.js) with it in mind; nobody integrates anything per frame.

export const DEG = Math.PI / 180;

/** The cable: Ø 52 mm, a strand's pitch `lay` (the stripes the eye reads running), 5 m/s on the line (18 km/h). */
export const CABLE = { r: 2.6, lay: 30, speed: 500, kmh: 18 };
/** Its height in the station (the grip CLOSED: its axis). */
export const CABLE_Y = 330;
/** Half the distance between the two sides (the bullwheel's radius). */
export const SIDE = 260;

/** The station (true scale, a station with tyre conveyors ≈ 26 m long): its floor, its housing of glass. */
export const STATION = {
  x0: -1200, x1: 1500, //    from behind the bullwheel to the mouth where the line starts
  half: 520, //              its half width (z), the housing's
  roof: 620, //              the housing's roof (y)
  mouth: 1500, //            the mouth (x): the line starts here, on both sides
  quay: [-900, 0], //        the boarding quay on the departure side (x): you board here, at walking pace
  board: -500, //            where you sit down (x)
  gate: -700, //             the boarding gate (x), the décorateur's
};
/** The bullwheel (grande poulie): its centre, its radius (the cable round it), its axis vertical. */
export const BULLWHEEL = { at: [-900, CABLE_Y, 0], r: SIDE, rim: 18 };

const A_LEN = STATION.mouth - BULLWHEEL.at[0]; //        2400: the arrival straight
const TURN = Math.PI * SIDE; //                          ≈ 817: the half turn
export const PATH = { A: A_LEN, C0: A_LEN + TURN, END: 2 * A_LEN + TURN };

/** The came (came de débrayage / d'embrayage): ONE beam all along the station, in the grip frame. It presses the
 *  lever's roller DOWN by `push` cm: the grip open. It starts on the arrival side at x `startX` (a ramp `ramp` long),
 *  runs round the bullwheel, and stops on the departure side at x `stopX` — where the spring closes the grip.
 *  `y` its underside, `z` its centre line (grip frame, outward), `w` × `h` its section. */
export const CAME = { y: 12, z: 14, w: 9, h: 7, push: 6, ramp: 120, startX: 1380, stopX: 1050 };
/** In the station the open grip rides `free` cm BELOW the cable (the rail carries the chair): the gap between the
 *  jaws and the cable that the hook shows. 0 on the cable. */
export const FREE = 10;
/** The weighing (capteur de pesage): an instrumented length of came AFTER the closing, at the end of the quay (x),
 *  its gauge (a bar of light on a post, outside the departure rail: world point). `ok` the share of full force
 *  under which the gauge stands in its red band (no figure on screen: it depends on the grip). */
export const WEIGH = { x0: 1130, x1: 1330, gauge: [1240, 425, 430], ok: 0.62 };
/** The tyre rows (trains de pneus) under the grips' friction plate: tyres every `pitch` cm, radius `r`, at `y` in
 *  the grip frame (their top touches the plate). Slowing on the arrival side, launching on the departure side. */
export const TYRES = {
  r: 20, w: 12, pitch: 75, y: -61,
  slow: [1300, 300], //      arrival side: x from → to (1 → 0.2 of the cable's speed)
  launch: [0, 1000], //      departure side: x from → to (0.2 → 1)
  turn: true, //             a row at 0.2 round the bullwheel and along the quay
};
/** The side track where a chair badly gripped is isolated (voie de garage): it leaves the departure rail at x `from`
 *  and bends outward to z `z` by x `to`, a dead end inside the station. */
export const GARAGE = { from: 1080, to: 1440, z: SIDE + 300 };

/** The grip (model.js), in the grip frame. Provisional on stubs: model.js may move a part and write the line here
 *  (« À changer ailleurs »); gare.js and ligne.js read only `came`, `plate`, `hanger`, `roller`. */
export const GRIP = {
  len: 56, //                  body length along x
  fixedJaw: [0, -1, -4], //    the fixed jaw (mors fixe) cradles the cable on the inner side
  mobileJaw: [0, 1, 5], //     the mobile jaw (mors mobile) closes on it from the outer side; `open` swings it 25°
  lever: { pivot: [-18, 2, 10.75], len: 19 }, //   the lever (levier): a bell crank, its long arm back (−x) and up to its roller
  roller: { at: [-34, 12.5, 14], r: 5.5 }, //  the roller (galet) the came presses down (top at 18: CAME.y + push)
  spring: { at: [14, -16, 12], len: 30, r: 5 }, //  the clamping spring (ressort de serrage), a coil along x: the heart
  plate: { y: -40, len: 72, w: 14 }, //       the friction plate the tyres drive (below the body, on the hanger's head)
  hanger: [0, -42, 0], //      where the chair's hanger (glass, ligne.js) hangs from
};
/** The chair (ligne.js, glass): a four-seat chair, its hanger from the grip down to the seat, the seat `seatY`
 *  under the cable (40 cm above the quay when free), `width` across (grip z), facing the way it travels. */
export const CHAIR = { hang: 250, seatY: -280, width: 220, depth: 60, back: 70, bar: 80, spacing: 1200 };

/** The line (ligne.js): the station mouth, then towers (x, height of the cable at the top); the cable is a straight
 *  run between tops (a sag is the décor's). The STEEPEST span (pente la plus raide) is between towers 2 and 3. */
export const LINE = {
  towers: [[4000, 1500], [7500, 2300], [11500, 4900], [16000, 7600], [21000, 9600]],
  steep: [1, 2], //            the span from towers[1] to towers[2]: the comment's shot
  top: 22000, //               where the line goes out of sight (x)
};
/** The ground outside the station, under the line (x, y): it drops into a hollow right past the mouth (« sous
 *  toi… la pente »), then climbs. Linear between points; the décor smooths it. Across, it is flat (z). */
export const GROUND = [[1500, 0], [1850, -480], [3200, -720], [5000, 300], [9000, 2300], [13500, 5000], [18000, 7000], [24000, 9000]];
export const groundAt = (x) => {
  if (x <= GROUND[0][0]) return 0;
  for (let i = 1; i < GROUND.length; i++) {
    const [x1, y1] = GROUND[i];
    const [x0, y0] = GROUND[i - 1];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return GROUND[GROUND.length - 1][1];
};

// the line's polyline from the mouth (cumulated lengths), the same both sides
const LPTS = [[STATION.mouth, CABLE_Y], ...LINE.towers];
const LCUM = [0];
for (let i = 1; i < LPTS.length; i++) LCUM.push(LCUM[i - 1] + Math.hypot(LPTS[i][0] - LPTS[i - 1][0], LPTS[i][1] - LPTS[i - 1][1]));
export const LINE_LEN = LCUM[LCUM.length - 1];

function lineAt(u, side, out) {
  const n = LPTS.length;
  let i = 1;
  while (i < n - 1 && LCUM[i] < u) i++;
  const [x0, y0] = LPTS[i - 1];
  const [x1, y1] = LPTS[i];
  const L = LCUM[i] - LCUM[i - 1];
  const k = Math.min(1.2, Math.max(0, (u - LCUM[i - 1]) / L));
  out.x = x0 + (x1 - x0) * k;
  out.y = y0 + (y1 - y0) * k;
  out.z = side * SIDE;
  const pitch = Math.atan2(y1 - y0, x1 - x0);
  // departure travels up (+x), arrival travels down (−x)
  out.yaw = side > 0 ? 0 : Math.PI;
  out.pitch = side > 0 ? pitch : -pitch;
  return out;
}

/** Where the chair at abscissa `s` is, with its grip CLOSED (the cable's axis): writes { x, y, z, yaw, pitch } in
 *  `out` (no allocation). `yaw` maps the grip frame's x to the travel (rotation.y), `pitch` tilts it along a climb
 *  (rotation.z, the grip only: the hanger hangs plumb). `iso` (0 → 1) bends the departure rail onto the side track.
 *  The station's FREE drop is NOT in it: ligne.js applies it from `free`. */
export function pathAt(s, out, iso = 0) {
  const { A, C0, END } = PATH;
  const [bx, , bz] = BULLWHEEL.at;
  out.y = CABLE_Y;
  out.pitch = 0;
  if (s < 0) return lineAt(-s, -1, out);
  if (s <= A) {
    out.x = STATION.mouth - s;
    out.z = -SIDE;
    out.yaw = Math.PI;
  } else if (s <= C0) {
    const th = (s - A) / SIDE;
    out.x = bx - SIDE * Math.sin(th);
    out.z = bz - SIDE * Math.cos(th);
    out.yaw = Math.PI + th; // the tangent turns from −x to +x behind the wheel
  } else if (s <= END) {
    out.x = bx + (s - C0);
    out.z = SIDE;
    out.yaw = 0;
    if (iso > 0 && out.x > GARAGE.from) {
      const k = Math.min(1, (out.x - GARAGE.from) / (GARAGE.to - GARAGE.from));
      const e = k * k * (3 - 2 * k);
      out.z = SIDE + (GARAGE.z - SIDE) * e * iso;
      out.yaw = -Math.atan2((GARAGE.z - SIDE) * iso * 6 * k * (1 - k), GARAGE.to - GARAGE.from);
    }
  } else return lineAt(s - END, 1, out);
  return out;
}

/** The abscissa of a point of the departure straight (x) and of the arrival straight (x). */
export const sDeparture = (x) => PATH.C0 + (x - BULLWHEEL.at[0]);
export const sArrival = (x) => STATION.mouth - x;

/** The chair's speed at `s`, as a fraction of the cable's: what the tyres impose (1 on the line, 0.2 at the quay). */
export function speedAt(s) {
  const a0 = sArrival(TYRES.slow[0]);
  const a1 = sArrival(TYRES.slow[1]);
  const d0 = sDeparture(TYRES.launch[0]);
  const d1 = sDeparture(TYRES.launch[1]);
  if (s < a0 || s > d1) return 1;
  if (s < a1) return 1 - 0.8 * ((s - a0) / (a1 - a0));
  if (s < d0) return 0.2;
  return 0.2 + 0.8 * ((s - d0) / (d1 - d0));
}

/** Where the hero chair stands in the story (abscissae), for the acts and the poses. */
export const AT = {
  hook: sArrival(1300), //         its roller just on the came: the grip opens (accroche)
  board: sDeparture(STATION.board), // you sit down (« dessus »), then « au pas »
  launch: sDeparture(TYRES.launch[0]), // the launching tyres start (« Devant, des pneus vont te lancer »)
  close: sDeparture(CAME.stopX), //  the came stops: the spring closes (zero)
  weigh: sDeparture((WEIGH.x0 + WEIGH.x1) / 2), // on the weighing (reponse)
  mouth: PATH.END, //               the station ends (« la gare finit »)
};

/** The bench: the grip stands with its cable axis BENCH_LIFT above the bench's origin (its plate just over the floor). */
export const BENCH_LIFT = 46;
/** ≈ the grip's radius: sizes the bench, its light, its shadows. */
export const GRIP_SIZE = 40;

/** The sky and the far crests (ligne.js): a dome at infinity, crests in ink lines, night with a cold horizon. */
export const SKY = { r: 300000, crests: [[60000, 9000], [110000, 16000], [180000, 22000]] };

/** The abscissa of the departure line's point above x (up the line), and of the arrival line's (down it). */
export function sLine(x, side = 1) {
  for (let i = 1; i < LPTS.length; i++) {
    const [x0] = LPTS[i - 1];
    const [x1] = LPTS[i];
    if (x <= x1 || i === LPTS.length - 1) {
      const u = LCUM[i - 1] + ((LCUM[i] - LCUM[i - 1]) * (x - x0)) / (x1 - x0);
      return side > 0 ? PATH.END + u : -u;
    }
  }
  return PATH.END;
}
/** The middle of the steepest span (x), where the comment's chair hangs. */
export const STEEP_X = (LINE.towers[LINE.steep[0]][0] + LINE.towers[LINE.steep[1]][0]) / 2;
