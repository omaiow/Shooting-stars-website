/**
 * CRT sound effects, synthesised with the Web Audio API (no audio files).
 *
 * The 3D page and the terminal inside its iframe are the same origin, so
 * they share ONE AudioContext kept on the top window: a click anywhere
 * unlocks sound for both, and the Sound switch (one master gain) mutes both.
 *
 * Browsers keep audio locked until the visitor clicks or presses a key.
 * One-shot effects are skipped while locked (so they never pile up and
 * blast out later); the hum is started anyway and simply fades in once
 * sound unlocks.
 */

import { useSyncExternalStore } from 'react';

const VOLUME = 0.55;

interface CrtAudio {
  ctx: AudioContext;
  master: GainNode;
  noise: AudioBuffer;
  /** A click or key press has happened, so the context is (about to be) running. */
  unlocked: boolean;
  hum: { gain: GainNode; nodes: AudioScheduledSourceNode[] } | null;
}

type AudioHost = Window & {
  __crtAudio?: CrtAudio;
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

/** The top window when we can reach it (same origin), else our own. */
function host(): AudioHost {
  try {
    const top = window.top as AudioHost | null;
    if (top && top !== window && top.location.origin === window.location.origin) return top;
  } catch {
    /* cross-origin parent: use our own window */
  }
  return window as AudioHost;
}

function audio(): CrtAudio | null {
  if (typeof window === 'undefined') return null;
  const h = host();
  if (h.__crtAudio) return h.__crtAudio;
  // Use the host window's constructor so the context outlives the iframe.
  const AC = h.AudioContext ?? h.webkitAudioContext;
  if (!AC) return null;
  try {
    const ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    comp.connect(ctx.destination);
    const master = ctx.createGain();
    master.gain.value = soundOn && !h.document.hidden ? VOLUME : 0;
    master.connect(comp);
    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    h.__crtAudio = { ctx, master, noise, unlocked: ctx.state === 'running', hum: null };
    h.document.addEventListener('visibilitychange', applyMaster);
    return h.__crtAudio;
  } catch {
    return null;
  }
}

/** Master level: muted when the switch is off or the tab is hidden. */
function applyMaster() {
  const a = host().__crtAudio;
  if (!a) return;
  const target = soundOn && !host().document.hidden ? VOLUME : 0;
  a.master.gain.setTargetAtTime(target, a.ctx.currentTime, 0.05);
}

function unlock() {
  const a = audio();
  if (!a) return;
  a.unlocked = true;
  if (a.ctx.state === 'suspended') a.ctx.resume().catch(() => {});
}

if (typeof window !== 'undefined') {
  // Capture phase, so it runs before the click's own handlers play anything.
  for (const type of ['pointerdown', 'keydown', 'touchend'] as const) {
    window.addEventListener(type, unlock, { capture: true, passive: true });
  }
}

/** Context ready for a one-shot effect, or null (locked / muted / unsupported). */
function live(): CrtAudio | null {
  if (!soundOn) return null;
  const a = audio();
  if (!a || !(a.unlocked || a.ctx.state === 'running')) return null;
  return a;
}

/* ── Sound setting ─────────────────────────────────────────────────── */

const SOUND_KEY = 'crt-sound';
const listeners = new Set<() => void>();
let soundOn = readSoundOn();

function readSoundOn(): boolean {
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem(SOUND_KEY) !== '0';
  } catch {
    return true;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== SOUND_KEY) return;
    soundOn = e.newValue !== '0';
    listeners.forEach((l) => l());
  });
}

export function setSoundOn(value: boolean): void {
  soundOn = value;
  try {
    localStorage.setItem(SOUND_KEY, value ? '1' : '0');
  } catch {
    /* won't persist, still works for this visit */
  }
  applyMaster();
  listeners.forEach((l) => l());
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => soundOn,
    () => true,
  );
}

/* ── Building blocks ───────────────────────────────────────────────── */

/** Exponential attack/decay envelope on a gain node. */
function envelope(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

interface NoiseOpts {
  type?: BiquadFilterType;
  freq: number;
  q?: number;
  peak: number;
  attack?: number;
  decay: number;
}

function noise(a: CrtAudio, t: number, o: NoiseOpts) {
  const src = a.ctx.createBufferSource();
  src.buffer = a.noise;
  const f = a.ctx.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.value = o.freq;
  f.Q.value = o.q ?? 1;
  const g = a.ctx.createGain();
  const attack = o.attack ?? 0.002;
  envelope(g, t, o.peak, attack, o.decay);
  src.connect(f).connect(g).connect(a.master);
  src.start(t, Math.random() * 1.5);
  src.stop(t + attack + o.decay + 0.05);
}

interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  /** Glide to this frequency over the sound's length. */
  to?: number;
  peak: number;
  attack?: number;
  decay: number;
  lowpass?: number;
}

function tone(a: CrtAudio, t: number, o: ToneOpts) {
  const osc = a.ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  const attack = o.attack ?? 0.003;
  const end = t + attack + o.decay;
  osc.frequency.setValueAtTime(o.freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, end);
  const g = a.ctx.createGain();
  envelope(g, t, o.peak, attack, o.decay);
  let out: AudioNode = osc;
  if (o.lowpass) {
    const f = a.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.lowpass;
    out = out.connect(f);
  }
  out.connect(g).connect(a.master);
  osc.start(t);
  osc.stop(end + 0.05);
}

/** The mechanical click of the power switch. */
function switchClick(a: CrtAudio, t: number) {
  noise(a, t, { freq: 2200, q: 1.5, peak: 0.35, attack: 0.001, decay: 0.03 });
  tone(a, t, { freq: 150, to: 60, peak: 0.4, decay: 0.1 });
}

/** Crackle of static charge on the glass. */
function staticCrackle(a: CrtAudio, t: number, length: number, level: number) {
  noise(a, t, { type: 'highpass', freq: 2500, peak: 0.1 * level, attack: 0.01, decay: length });
  const pops = Math.round(14 * length);
  for (let i = 0; i < pops; i++) {
    const at = t + Math.random() * length;
    noise(a, at, { freq: 3000 + Math.random() * 3000, q: 2, peak: 0.25 * level * Math.random(), attack: 0.001, decay: 0.008 });
  }
}

/* ── Effects ───────────────────────────────────────────────────────── */

export const crtSound = {
  /** Power on: switch click, the degauss "BWOMM", static on the glass. */
  powerOn() {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime + 0.01;
    switchClick(a, t);

    // Degauss: a loud mains-frequency buzz that rattles and dies away.
    const d = t + 0.09;
    const buzz = a.ctx.createGain();
    envelope(buzz, d, 0.32, 0.03, 1.5);
    const lp = a.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, d);
    lp.frequency.exponentialRampToValueAtTime(180, d + 1.5);
    lp.connect(buzz).connect(a.master);
    for (const [type, freq] of [['sawtooth', 60], ['square', 120], ['sine', 30]] as const) {
      const o = a.ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq * 1.04, d);
      o.frequency.exponentialRampToValueAtTime(freq, d + 0.4);
      o.connect(lp);
      o.start(d);
      o.stop(d + 1.6);
    }
    staticCrackle(a, t + 0.12, 0.9, 1);
  },

  /** Power off: click, the whine collapsing, a soft thump. */
  powerOff() {
    crtSound.stopHum(0.25);
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime + 0.01;
    switchClick(a, t);
    tone(a, t + 0.02, { freq: 15000, to: 2500, peak: 0.03, decay: 0.4 });
    tone(a, t + 0.03, { freq: 90, to: 28, peak: 0.35, decay: 0.35 });
    staticCrackle(a, t + 0.05, 0.3, 0.6);
  },

  /** The set's steady hum, tube hiss and flyback whine, while it's on. */
  startHum() {
    const a = audio();
    if (!a || a.hum) return;
    const t = a.ctx.currentTime;
    const gain = a.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + 1.5);
    gain.connect(a.master);
    const nodes: AudioScheduledSourceNode[] = [];

    const add = (src: AudioScheduledSourceNode, level: number, filter?: BiquadFilterNode) => {
      const g = a.ctx.createGain();
      g.gain.value = level;
      (filter ? src.connect(filter) : src).connect(g).connect(gain);
      src.start(t);
      nodes.push(src);
    };
    const osc = (freq: number) => {
      const o = a.ctx.createOscillator();
      o.frequency.value = freq;
      return o;
    };
    add(osc(60), 0.05);
    add(osc(120), 0.025);
    add(osc(15625), 0.0035); // the faint high whine of a running CRT
    const hiss = a.ctx.createBufferSource();
    hiss.buffer = a.noise;
    hiss.loop = true;
    const hp = a.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 5000;
    add(hiss, 0.012, hp);

    a.hum = { gain, nodes };
  },

  stopHum(fade = 0.2) {
    const a = host().__crtAudio;
    if (!a?.hum) return;
    const { gain, nodes } = a.hum;
    a.hum = null;
    const t = a.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + fade);
    nodes.forEach((n) => n.stop(t + fade + 0.05));
  },

  /** A small zap when the picture "catches". */
  crackle() {
    const a = live();
    if (!a || !a.hum) return;
    const t = a.ctx.currentTime;
    noise(a, t, { freq: 2800, q: 0.8, peak: 0.06, decay: 0.08 });
    tone(a, t, { type: 'sawtooth', freq: 60, peak: 0.05, decay: 0.12, lowpass: 400 });
  },

  /** A keyboard key; `enter` is the heavier return key. */
  key(kind: 'key' | 'enter' = 'key') {
    const a = live();
    if (!a) return;
    const now = a.ctx.currentTime;
    if (now - lastKey < 0.025) return;
    lastKey = now;
    const t = now + 0.002;
    if (kind === 'enter') {
      noise(a, t, { freq: 1500, q: 1.2, peak: 0.3, attack: 0.001, decay: 0.04 });
      tone(a, t, { freq: 120, to: 70, peak: 0.25, decay: 0.06 });
    } else {
      noise(a, t, { freq: 2200 + Math.random() * 1600, q: 1.4, peak: 0.2, attack: 0.001, decay: 0.022 });
      tone(a, t, { type: 'triangle', freq: 190 + Math.random() * 50, peak: 0.06, decay: 0.02 });
    }
  },

  /** PC-speaker beep: `post` = the all-clear at boot, `error` = bad command. */
  beep(kind: 'post' | 'error' = 'post') {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime + 0.01;
    if (kind === 'post') {
      tone(a, t, { type: 'square', freq: 1000, peak: 0.05, attack: 0.002, decay: 0.14, lowpass: 3500 });
    } else {
      tone(a, t, { type: 'square', freq: 220, peak: 0.06, attack: 0.002, decay: 0.2, lowpass: 2000 });
    }
  },

  /** Floppy motor spin-up and head seeks, then a little hard-drive chatter. */
  drives(length = 1.1) {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime + 0.01;

    // Motor whir.
    const motor = a.ctx.createOscillator();
    motor.type = 'sawtooth';
    motor.frequency.setValueAtTime(30, t);
    motor.frequency.linearRampToValueAtTime(42, t + 0.25);
    const bp = a.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 200;
    bp.Q.value = 1.5;
    const mg = a.ctx.createGain();
    mg.gain.setValueAtTime(0, t);
    mg.gain.linearRampToValueAtTime(0.09, t + 0.1);
    mg.gain.setValueAtTime(0.09, t + length - 0.15);
    mg.gain.linearRampToValueAtTime(0, t + length);
    motor.connect(bp).connect(mg).connect(a.master);
    motor.start(t);
    motor.stop(t + length + 0.05);

    // Head steps, in a few seek bursts ("brrrt").
    let at = t + 0.06;
    for (let burst = 0; burst < 3; burst++) {
      const steps = 6 + Math.floor(Math.random() * 14);
      const gap = 0.009 + Math.random() * 0.004;
      for (let s = 0; s < steps; s++) {
        noise(a, at, { freq: 1100, q: 5, peak: 0.28, attack: 0.001, decay: 0.01 });
        at += gap;
      }
      at += 0.08 + Math.random() * 0.15;
    }

    // Hard drive ticks.
    for (let i = 0; i < 9; i++) {
      const tick = t + length * (0.45 + Math.random() * 0.55);
      noise(a, tick, { freq: 4800, q: 2, peak: 0.12, attack: 0.001, decay: 0.006 });
    }
  },
};

let lastKey = 0;
