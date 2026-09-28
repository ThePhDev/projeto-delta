// springs.js: closed-form springs for UI motion (no CSS transitions, no timers).
// Every function is a pure function of time, so the same code drives live UI (requestAnimationFrame)
// and deterministic renders (seek(t) for video capture).
//
// Parameters are the human-friendly pair Apple uses: `duration` (seconds, perceived settle time)
// and `bounce` (damping ratio = 1 - bounce). Measured overshoot: 0 → none (critically damped),
// 0.1 → 0.2%, 0.2 → 1.5% ("a tiny overshoot at most"), 0.3 → 4.6%, 0.5 → 16% (too bouncy for UI).
// Negative bounce = overdamped, softer arrival.

/** Displacement-from-target response y(t) with y(0) = -1 and y'(0) = v0 (units of distance per second). */
export function stepResponse(t, { duration = 0.4, bounce = 0, v0 = 0 } = {}) {
  if (t <= 0) return -1;
  const w0 = (2 * Math.PI) / duration;
  const zeta = 1 - bounce;
  if (Math.abs(zeta - 1) < 1e-6) {            // critically damped
    return Math.exp(-w0 * t) * (-1 + (v0 - w0) * t);
  }
  if (zeta < 1) {                              // underdamped: overshoots (see table above)
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const B = (v0 - zeta * w0) / wd;
    return Math.exp(-zeta * w0 * t) * (-Math.cos(wd * t) + B * Math.sin(wd * t));
  }
  const s = w0 * Math.sqrt(zeta * zeta - 1);  // overdamped
  const r1 = -zeta * w0 + s, r2 = -zeta * w0 - s;
  const C2 = (v0 + r1) / (r2 - r1), C1 = -1 - C2;
  return C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
}

/** Progress 0→1 of a spring started at time 0. */
export const spring = (t, opts) => 1 + stepResponse(t, opts);

/**
 * A value that changes target many times, still a pure function of time:
 * the sum of one spring per change. `changes` = [{ t, to, duration?, bounce? }, ...] sorted by t.
 */
export function retarget(from, changes) {
  return (t) => {
    let v = from, prev = from;
    for (const c of changes) {
      v += (c.to - prev) * spring(t - c.t, c);
      prev = c.to;
    }
    return v;
  };
}

/**
 * Liquid indicator (tabs, toggle knob): the edge moving in the direction of travel rides a faster
 * spring than the trailing edge, so the shape stretches ahead and then catches up.
 * Returns { left, right } for time t. Positions are in px.
 */
export function liquidEdges(t, { t0, fromL, fromR, toL, toR, lead = 0.28, trail = 0.46, bounce = 0.05 }) {
  const forward = toL > fromL;
  const fast = { duration: lead, bounce }, slow = { duration: trail, bounce };
  const left = fromL + (toL - fromL) * spring(t - t0, forward ? slow : fast);
  const right = fromR + (toR - fromR) * spring(t - t0, forward ? fast : slow);
  return { left, right };
}

/** Rubber-band past a limit (iOS formula): resistance grows with distance, never a hard stop. */
export function rubberBand(x, min, max, dim, c = 0.55) {
  const band = (d) => (1 - 1 / ((d * c) / dim + 1)) * dim;
  if (x > max) return max + band(x - max);
  if (x < min) return min - band(min - x);
  return x;
}

/**
 * Direct manipulation: while held, the value follows the pointer (with rubber-band past the ends);
 * on release it springs from wherever it was, carrying the release velocity.
 */
export function dragThenRelease(t, { tRelease, heldValue, releaseValue, releaseVelocity = 0, to, duration = 0.45, bounce = 0.08 }) {
  if (t < tRelease) return heldValue(t);
  const dist = to - releaseValue;
  const v0 = dist === 0 ? 0 : releaseVelocity / dist;  // normalise velocity to the unit step
  return releaseValue + dist * spring(t - tRelease, { duration, bounce, v0 });
}

/**
 * Content swap inside a morphing container: the old content exits (fade + blur + slight scale) and
 * the new one enters after an offset, so the two never overlap. Returns style numbers for each.
 */
export function swap(t, { t0, exit = 0.12, gap = 0.04, enter = 0.22, blur = 6 }) {
  const out = Math.min(Math.max((t - t0) / exit, 0), 1);
  const inn = spring(t - (t0 + exit + gap), { duration: enter, bounce: 0 });
  return {
    old: { opacity: 1 - out, blur: blur * out, scale: 1 - 0.04 * out },
    next: { opacity: Math.min(Math.max(inn, 0), 1), blur: blur * (1 - Math.min(Math.max(inn, 0), 1)), scale: 0.96 + 0.04 * inn },
  };
}

/** Beat grid helper: time of beat n (0-based) at `bpm`, with an offset to the first downbeat. */
export const beat = (n, bpm = 120, offset = 0) => offset + (n * 60) / bpm;

/** Live helper for normal UI: retargetable spring that keeps its velocity when the target changes. */
export class LiveSpring {
  constructor(value, { duration = 0.35, bounce = 0 } = {}) {
    this.opts = { duration, bounce }; this.from = value; this.to = value; this.t0 = 0; this.v0 = 0;
  }
  _state(now) {
    const dt = 1e-3, t = now - this.t0, d = this.to - this.from;
    const p = (x) => this.from + d * spring(x, { ...this.opts, v0: this.v0 });
    return { x: d === 0 ? this.to : p(t), v: d === 0 ? 0 : (p(t + dt) - p(t - dt)) / (2 * dt) };
  }
  set(target, now = performance.now() / 1000) {
    const { x, v } = this._state(now);
    this.from = x; this.to = target; this.t0 = now;
    this.v0 = target === x ? 0 : v / (target - x);
  }
  get(now = performance.now() / 1000) { return this._state(now).x; }
}
