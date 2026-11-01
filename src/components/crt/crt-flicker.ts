/**
 * One shared CRT flicker signal.
 *
 * It is a pure function of wall-clock time, so the terminal (inside the
 * iframe) and the 3D screen lights (in the parent page) compute exactly the
 * same value at the same moment and flicker in sync without talking to
 * each other.
 *
 *   - a 30 Hz shimmer (the tube's refresh noise)
 *   - every 6-8 seconds or so a "catch": two quick dips with a small
 *     sideways jolt of the picture
 *
 * Kept under 3 flashes per second (photosensitivity guidance); callers skip
 * it entirely for prefers-reduced-motion. Tune with FLICKER_STRENGTH.
 */

import { useSyncExternalStore } from 'react';

/** 0 = off, 1 = default, 2 = very obvious. */
export const FLICKER_STRENGTH = 1;

export const FLICKER_HZ = 30;
const WINDOW_MS = 6000; // at most one catch per window (some windows skip)
const CATCH_MS = 160;

/** Deterministic 0..1 hash of a number. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Milliseconds into the current catch, or -1 when not in one. */
function catchPhase(nowMs: number): { dt: number; w: number } {
  const w = Math.floor(nowMs / WINDOW_MS);
  if (hash(w + 0.5) < 0.2) return { dt: -1, w };
  // Keep ≥ 500 ms from both window edges so two catches are always ≥ 1 s apart.
  const at = 500 + hash(w + 0.25) * (WINDOW_MS - CATCH_MS - 1000);
  const dt = nowMs - w * WINDOW_MS - at;
  return { dt: dt >= 0 && dt < CATCH_MS ? dt : -1, w };
}

/* ── Steady-light setting ──────────────────────────────────────────────
 * Saved in localStorage so the 3D frame and the terminal (a separate
 * same-origin document in the iframe) share it: changing it in one fires a
 * `storage` event in the other. Remembered between visits.
 */
const STEADY_KEY = 'crt-steady-light';
const listeners = new Set<() => void>();
let steady = readSteady();

function readSteady(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(STEADY_KEY) === '1';
  } catch {
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STEADY_KEY) return;
    steady = e.newValue === '1';
    listeners.forEach((l) => l());
  });
}

export function isSteadyLight(): boolean {
  return steady;
}

export function setSteadyLight(value: boolean): void {
  steady = value;
  try {
    localStorage.setItem(STEADY_KEY, value ? '1' : '0');
  } catch {
    /* private mode etc. — the setting just won't persist */
  }
  listeners.forEach((l) => l());
}

/** React hook: current steady-light setting, re-renders when it changes. */
export function useSteadyLight(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => steady,
    () => false,
  );
}

/** Brightness multiplier around 1 (≈0.78 … 1.03 at strength 1). */
export function crtFlicker(nowMs: number = Date.now()): number {
  if (steady) return 1;
  const step = Math.floor((nowMs / 1000) * FLICKER_HZ);
  const shimmer = (hash(step) - 0.5) * 0.06;

  const { dt, w } = catchPhase(nowMs);
  let dip = 0;
  if (dt >= 0) {
    // drop – recover – drop – recover
    const depth = 0.16 + 0.08 * hash(w + 0.75);
    if (dt < 45) dip = depth;
    else if (dt < 80) dip = depth * 0.25;
    else if (dt < 125) dip = depth * 0.8;
  }
  return 1 + (shimmer - dip) * FLICKER_STRENGTH;
}

/** Sideways jolt of the picture in px during a catch (0 otherwise). */
export function crtJitter(nowMs: number = Date.now()): number {
  if (steady) return 0;
  const { dt, w } = catchPhase(nowMs);
  if (dt < 0 || dt >= 125) return 0;
  const dir = hash(w + Math.floor(dt / 40)) > 0.5 ? 1 : -1;
  return dir * (1 + hash(w + 0.9)) * FLICKER_STRENGTH;
}
