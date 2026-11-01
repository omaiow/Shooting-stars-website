/**
 * One shared CRT flicker signal.
 *
 * It is a pure function of wall-clock time, so the terminal (inside the
 * iframe) and the 3D screen lights (in the parent page) compute exactly the
 * same value at the same moment and flicker in sync without talking to
 * each other.
 *
 * Returns a brightness multiplier around 1:
 *   - a faint 30 Hz shimmer (the tube's refresh noise), ±1.5%
 *   - every few seconds a brief "hiccup" dip of up to ~9%, ~90 ms long
 * Amplitudes stay small on purpose (photosensitivity), and callers skip it
 * entirely for prefers-reduced-motion.
 */

/** Deterministic 0..1 hash of an integer. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const FLICKER_HZ = 30;

export function crtFlicker(nowMs: number = Date.now()): number {
  // 30 Hz stepped shimmer
  const step = Math.floor((nowMs / 1000) * FLICKER_HZ);
  const shimmer = (hash(step) - 0.5) * 0.03;

  // Hiccups: each 4 s window gets one dip at a random moment (some windows skip).
  const windowMs = 4000;
  const w = Math.floor(nowMs / windowMs);
  let dip = 0;
  if (hash(w + 0.5) > 0.35) {
    const at = hash(w + 0.25) * (windowMs - 200);
    const dt = nowMs - w * windowMs - at;
    if (dt >= 0 && dt < 90) {
      // two quick drops, like a tube catching
      dip = (dt < 35 || dt > 60 ? 0.09 : 0.04) * (0.6 + 0.4 * hash(w + 0.75));
    }
  }
  return 1 + shimmer - dip;
}
