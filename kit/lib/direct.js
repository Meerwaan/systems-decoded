// The director: what every film used to write again — the two timelines, the state of the world, the
// shots and the cuts, the labels that follow a point, the readouts of the header, the hand-over from
// the hook to the captions, the way back to the first frame. Lifted from the staging of 007.
//
//   const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
//   const { S, T, tl, st, now, shot, cut, chip, panel } = D;
//   …acts: only st / now / shot / cut / tl calls, on times read off the script (T.at)…
//   D.commit({ hook: ["accroche", "promesse"] });
//   stage.onUpdate((time) => world.apply(D.W, time));   // the director has already seeked the state and the camera
//   stage.start();
//
// `S` is the state of the world: plain numbers, the only thing the acts move (what draws reads `D.W`: S, plus
// whatever a trial frame holds). `S.set` says which set
// is on (a cut changes it). The camera the shots move is `D.C`; the stage's own `cam` is C plus — when
// the film gives a `ride` — the travel of what it follows.
import { makeTiming } from "./timing.js";
import { buildCaptions, buildHook, setAct, brandHud } from "./overlay.js";

export const DEG = Math.PI / 180;
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const smooth = (u) => u * u * (3 - 2 * u);
/** 0 before `a`, 1 after `b`, straight in between. */
export const ramp = (x, a, b) => clamp01((x - a) / (b - a));

/** A value along [time, value] keys, straight from one to the next. */
export const along = (keys, time) => {
  if (time <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (time < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (time - keys[i - 1][0]) / Math.max(1e-6, keys[i][0] - keys[i - 1][0]));
  }
  return keys.at(-1)[1];
};

/**
 * The same picture from the same place, aimed at a nearer point of the same line of sight: where the
 * next move should leave from (a pose aimed far away sends the camera out of the set as it turns).
 */
export const reaim = (pose, d) => {
  const az = pose.az * DEG;
  const el = pose.el * DEG;
  const k = pose.d - d;
  return { roll: 0, side: 0, ...pose, d, tx: pose.tx + k * Math.sin(az) * Math.cos(el), ty: pose.ty + k * Math.sin(el), tz: pose.tz + k * Math.cos(az) * Math.cos(el) };
};

/** A pose written around an object standing at `from`, moved to where the same object stands at `to`. */
export const moved = (pose, from, to = [0, 0, 0]) => ({ ...pose, tx: pose.tx - from[0] + to[0], ty: pose.ty - from[1] + to[1], tz: pose.tz - from[2] + to[2] });

/**
 * `first`  the state of the world on the first frame (and on the last: the film loops)
 * `pose0`  the camera of the first frame — complete: tx, ty, tz, d, az, el, fov, shift, side, roll, drift
 * `ride`   (S) => [x, y, z]: the travel of what the camera follows, added to every shot (and to the
 *          light, if the film reads `D.riding`). A shot is then written once, around the thing where it
 *          stands, and holds while the thing flies.
 */
export function createDirector({ EP = window.__EPISODE, stage, first, pose0, ride = null }) {
  const T = makeTiming(EP);
  const END = EP.duration;
  const $ = (id) => document.getElementById(id);
  const { cam } = stage;
  const S = { set: 0, ...first, shake: 0 };
  // The world as it is drawn: S and — on a trial frame — the numbers `look` holds for that frame ("state"). The
  // film hands W, not S, to what draws: a held number then never leaks into the next frame.
  const W = { ...S };
  const C = { ...cam, ...pose0 };
  Object.assign(cam, C);

  const tl = gsap.timeline({ paused: true }); // the page (registered with HyperFrames)
  const tw = gsap.timeline({ paused: true }); // the world (seeked by the stage)
  tl.to({}, { duration: END }, 0);

  /* ───────────── the world ───────────── */
  const st = (at, dur, props, ease = "power2.inOut") => tw.to(S, { ...props, duration: dur, ease }, at);
  const now = (at, props) => tw.set(S, props, at);
  const shots = [];
  /**
   * A move of the camera. `fromD`: for a dive or a long pull-back, the distance it leaves from — the
   * distance then changes by ratio, not by centimetres, and the point it aims at moves with the distance.
   */
  const shot = (at, dur, pose, ease = "sine.inOut", fromD = null) => shots.push({ at, dur, pose, ease, fromD });
  /** A cut: the picture jumps to another set (or another angle) on one frame. `pose` must be complete. */
  const cut = (at, set, pose, state = {}) => {
    stage.cut(at);
    now(at, { set, ...state });
    shots.push({ at, cut: true, pose: { roll: 0, side: 0, fov: 28, drift: 0.3, ...pose } });
  };
  /** A knock on the camera (never on a wide picture full of level lines: one frame jumps and comes back). */
  const jolt = (at, k, dur = 0.5) => {
    st(at, 0.04, { shake: k }, "power2.out");
    st(at + 0.04, dur, { shake: 0 }, "power2.out");
  };

  /* ───────────── the page ───────────── */
  const show = (sel, at, dur = 0.3) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: dur }, at);
  const hide = (sel, at, dur = 0.2) => tl.to(sel, { opacity: 0, duration: dur }, at);
  const blip = (sel, at, peak, up = 0.05, down = 0.5) => {
    tl.to(sel, { opacity: peak, duration: up }, at);
    tl.to(sel, { opacity: 0, duration: down }, at + up);
  };
  const seen = new Set();
  /** A panel of the top slot, from `at` to `until` (one at a time: it has left before the next comes). */
  const panel = (sel, at, until) => {
    tl.fromTo(sel, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: !seen.has(sel) }, at);
    tl.to(sel, { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, until);
    seen.add(sel);
  };
  const chips = []; // [element, anchor, dx, dy]: placed every frame on a point of the scene (or fixed, without an anchor)
  /** A `.chip--live` placed on a point of the scene (`anchor`: Object3D or Vector3), or at (dx, dy) when `anchor` is null. */
  const follow = (id, anchor, dx, dy) => chips.push([$(id), anchor, dx, dy]);
  /** follow + show + hide. While the camera travels, give a chip a fixed place in the top slot: chip(id, null, 96, 470, from, to). */
  const chip = (id, anchor, dx, dy, from, to) => {
    follow(id, anchor, dx, dy);
    show(`#${id}`, from, 0.2);
    if (to != null) hide(`#${id}`, to, 0.12);
  };
  const meters = []; // [element, fn, last]: a text of the page rewritten when its value changes
  /** `fn(time)` → the text of #id, every frame (the story clock, a counter of the header). */
  const readout = (id, fn) => meters.push([$(id), fn, null]);

  /* ───────────── the end is the beginning ───────────── */
  const tEnd = END - 0.07; // everything is back to the first frame two frames before the end
  const handOver = END - 0.34; // the last caption leaves
  let decodedAt = null;
  let resetAt = null;
  /** The instant the system gives up its secret: the account name lights up in the header. */
  const verdict = (at) => (decodedAt = at);
  /**
   * The way back to the first frame, from `at` (the cut or the move that opens the last sentence):
   * between `rewindAt` and the end the camera returns to `pose0`, and every number of the state that
   * is not yet what `first` says glides back to it (worked out at commit, once every act is written).
   * What cannot glide — the set, a thing that is there or not — is put back by the cut at `at`.
   * `fromD`: see shot().
   */
  let looping = null;
  const loop = ({ at, rewindAt = at, fromD = null, ease = "sine.inOut" }) => {
    resetAt = at;
    looping = { rewindAt, ease };
    setAct(tl, 1, at);
    shot(rewindAt, tEnd - rewindAt, pose0, ease, fromD);
  };

  const riding = [0, 0, 0];
  stage.onUpdate((time) => {
    tw.time(time);
    Object.assign(W, S, window.SD?.force);
    Object.assign(cam, C);
    if (ride) {
      const [x, y, z] = ride(W);
      riding[0] = x;
      riding[1] = y;
      riding[2] = z;
      cam.tx += x;
      cam.ty += y;
      cam.tz += z;
    }
    cam.roll = C.roll + W.shake * Math.sin(time * 30) * 1.1;
  });
  stage.onProject((time) => {
    for (const [el, anchor, dx, dy] of chips) {
      const p = anchor ? stage.project(anchor) : { x: 0, y: 0 };
      el.style.transform = `translate(${(p.x + dx).toFixed(1)}px, ${(p.y + dy).toFixed(1)}px)`;
    }
    for (const m of meters) {
      const text = m[1](time);
      if (text !== m[2]) m[0].textContent = m[2] = text;
    }
  });

  /**
   * Once every act is written: the text on screen (`hook`: the beats shown as cards, the captions take
   * the rest), the header's verdict, and the shots laid on the timeline in order.
   */
  const commit = ({ hook = ["accroche", "promesse"], captions = {} } = {}) => {
    brandHud(tl, { decodedAt, resetAt });
    buildHook($("hook"), EP, tl, { beats: hook, loopAt: handOver });
    buildCaptions($("captions"), EP, tl, { skip: hook, lastEnd: handOver, ...captions });
    shots.sort((a, b) => a.at - b.at);
    shots.forEach((s, i) => {
      if (s.cut) return tw.set(C, s.pose, s.at);
      const room = (shots[i + 1]?.at ?? END) - s.at;
      const duration = Math.min(s.dur, Math.max(0.05, room));
      const r = s.fromD == null || s.pose.d == null ? 1 : s.pose.d / s.fromD;
      if (Math.abs(r - 1) < 1e-3) return tw.to(C, { ...s.pose, duration, ease: s.ease }, s.at);
      const { d, tx, ty, tz, ...turn } = s.pose;
      const aim = Object.fromEntries(Object.entries({ d, tx, ty, tz }).filter(([, v]) => v !== undefined));
      tw.to(C, { ...turn, duration, ease: s.ease }, s.at);
      tw.to(C, { ...aim, duration, ease: (u) => (Math.pow(r, 0.5 - 0.5 * Math.cos(Math.PI * u)) - 1) / (r - 1) }, s.at);
    });
    const numbers = Object.keys(first).filter((k) => typeof first[k] === "number" && k !== "set");
    if (looping) {
      tw.time(looping.rewindAt + 1e-4);
      const away = numbers.filter((k) => Math.abs(S[k] - first[k]) > 1e-6);
      if (away.length) tw.to(S, { ...Object.fromEntries(away.map((k) => [k, first[k]])), duration: tEnd - looping.rewindAt, ease: looping.ease }, looping.rewindAt);
    }
    // the last picture must be the first one: say what is not back, while there is time to fix it
    tw.time(END);
    const off = [...numbers, "set"].filter((k) => Math.abs((S[k] ?? 0) - (first[k] ?? 0)) > 1e-4);
    const offCam = Object.keys(pose0).filter((k) => Math.abs(C[k] - pose0[k]) > 1e-3);
    if (off.length || offCam.length) console.warn(`[direct] la dernière image n'est pas la première — état: ${off.join(", ") || "ok"} · caméra: ${offCam.join(", ") || "ok"}`);
    tw.time(0);
    return tl;
  };

  return {
    EP, T, END, tEnd, handOver, S, W, C, tl, tw, first, pose0, riding,
    at: T.at, st, now, shot, cut, jolt, show, hide, blip, panel, follow, chip, readout, verdict, loop, commit,
    /** { name: "beat:mot" } → { name: seconds } */
    times: (refs) => Object.fromEntries(Object.entries(refs).map(([k, ref]) => [k, T.at(ref)])),
  };
}
