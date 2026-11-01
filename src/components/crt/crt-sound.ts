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
/**
 * Schedule effects this far ahead. The audio clock the page reads can lag
 * the sound card by a buffer (10–40 ms on Windows / Bluetooth), and a short
 * sound scheduled "in the past" gets cut off or plays silently.
 */
const LEAD = 0.04;

interface CrtAudio {
  ctx: BaseAudioContext;
  master: GainNode;
  noise: AudioBuffer;
  /** A click or key press has happened, so the context is (about to be) running. */
  unlocked: boolean;
  hum: { gain: GainNode; nodes: AudioScheduledSourceNode[] } | null;
  /** Pre-rendered short sounds (see SAMPLES): played instantly, nothing scheduled to miss. */
  bank?: Partial<Record<SfxName, AudioBuffer[]>> | 'building';
  /** Plastic swivel noise while the monitor is being turned. */
  swivel?: { gain: GainNode; level: number };
}

/** The live (real-time) context, for resume(). */
const realtime = (a: CrtAudio) => a.ctx as AudioContext;

type AudioHost = Window & {
  __crtAudio?: CrtAudio;
  AudioContext?: typeof AudioContext;
  OfflineAudioContext?: typeof OfflineAudioContext;
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
  if (a.ctx.state === 'suspended') realtime(a).resume().catch(() => {});
  if (!a.bank) buildBank(a);
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
  /** Sweep the filter to this frequency over the sound's length. */
  to?: number;
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
  f.Q.value = o.q ?? 1;
  const g = a.ctx.createGain();
  const attack = o.attack ?? 0.002;
  f.frequency.setValueAtTime(o.freq, t);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + attack + o.decay);
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
    const t = a.ctx.currentTime + LEAD;
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
    const t = a.ctx.currentTime + LEAD;
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
    const t = a.ctx.currentTime + LEAD;
    noise(a, t, { freq: 2800, q: 0.8, peak: 0.06, decay: 0.08 });
    tone(a, t, { type: 'sawtooth', freq: 60, peak: 0.05, decay: 0.12, lowpass: 400 });
  },

  /** A keyboard key; `enter` is the heavier return key. */
  key(kind: 'key' | 'enter' = 'key') {
    sfx(kind);
  },

  stopSwivel() {
    const a = host().__crtAudio;
    if (!a?.swivel) return;
    a.swivel.level = 0;
    a.swivel.gain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.05);
  },

  /** Loudness of the plastic swivel while the monitor turns (speed in rad/s). */
  swivel(speed: number) {
    const a = live();
    if (!a) return;
    if (!a.swivel) {
      const src = a.ctx.createBufferSource();
      src.buffer = a.noise;
      src.loop = true;
      const bp = a.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 420;
      bp.Q.value = 0.9;
      const gain = a.ctx.createGain();
      gain.gain.value = 0;
      src.connect(bp).connect(gain).connect(a.master);
      src.start();
      a.swivel = { gain, level: 0 };
    }
    const level = Math.min(0.16, speed * 0.07);
    if (Math.abs(level - a.swivel.level) < 0.003) return;
    a.swivel.level = level;
    a.swivel.gain.gain.setTargetAtTime(level, a.ctx.currentTime, 0.04);
  },

  /** PC-speaker beep: `post` = the all-clear at boot, `error` = bad command. */
  beep(kind: 'post' | 'error' = 'post') {
    const a = live();
    if (!a) return;
    const t = a.ctx.currentTime + LEAD;
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
    const t = a.ctx.currentTime + LEAD;

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

/** One key click, synthesised at time `t` into `a`. */
function keyClick(a: CrtAudio, t: number, kind: 'key' | 'enter') {
  if (kind === 'enter') {
    noise(a, t, { freq: 1500, q: 1.2, peak: 0.65, attack: 0.001, decay: 0.045 });
    tone(a, t, { freq: 120, to: 70, peak: 0.35, decay: 0.06 });
  } else {
    noise(a, t, { freq: 2200 + Math.random() * 1600, q: 1.4, peak: 0.55, attack: 0.001, decay: 0.026 });
    tone(a, t, { type: 'triangle', freq: 190 + Math.random() * 50, peak: 0.14, decay: 0.022 });
  }
}

/* ── Instant sounds ────────────────────────────────────────────────────
 * Short effects are rendered once (offline) when sound unlocks, then played
 * straight away on demand. Until the bank is ready they're synthesised live.
 */

interface Sample {
  /** Variations to render (one is picked at random each time). */
  n?: number;
  /** Seconds to render. */
  len: number;
  /** Random pitch wobble per play (fraction), for less robotic repeats. */
  jitter?: number;
  draw: (a: CrtAudio, t: number) => void;
}

/** Square-wave "PC speaker" tone. */
const sq = (freq: number, decay: number, peak = 0.1, to?: number): ToneOpts => ({
  type: 'square',
  freq,
  to,
  peak,
  attack: 0.002,
  decay,
  lowpass: 4000,
});

/** A run of square-wave notes. */
function notes(a: CrtAudio, t: number, freqs: number[], each: number, peak = 0.09, last = each) {
  freqs.forEach((f, i) => tone(a, t + i * each, sq(f, i === freqs.length - 1 ? last : each * 0.85, peak)));
}

/** A steady tone held for `dur` seconds (no decay). */
function held(a: CrtAudio, t: number, dur: number, freq: number, peak: number, type: OscillatorType = 'sine') {
  const o = a.ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.005);
  g.gain.setValueAtTime(peak, t + dur - 0.005);
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g).connect(a.master);
  o.start(t);
  o.stop(t + dur + 0.01);
}

/** Dial-up modem: dial tone, a number dialled, answer tone, handshake screech. */
function modem(a: CrtAudio, t: number) {
  held(a, t, 0.5, 350, 0.035);
  held(a, t, 0.5, 440, 0.035);
  const rows = [697, 770, 852, 941];
  const cols = [1209, 1336, 1477];
  for (let i = 0; i < 7; i++) {
    const at = t + 0.62 + i * 0.11;
    held(a, at, 0.07, rows[Math.floor(Math.random() * 4)], 0.03);
    held(a, at, 0.07, cols[Math.floor(Math.random() * 3)], 0.03);
  }
  held(a, t + 1.5, 0.45, 2100, 0.025);
  let at = t + 2.05;
  while (at < t + 4.1) {
    const seg = 0.04 + Math.random() * 0.07;
    held(a, at, seg, [980, 1180, 1650, 1850, 2400][Math.floor(Math.random() * 5)], 0.02, 'sawtooth');
    at += seg;
  }
  noise(a, t + 2.6, { freq: 1800, q: 0.8, peak: 0.06, attack: 0.05, decay: 1.4 });
}

const SAMPLES = {
  /* Terminal keyboard */
  key: { n: 6, len: 0.1, jitter: 0.06, draw: (a, t) => keyClick(a, t, 'key') },
  enter: { n: 2, len: 0.12, jitter: 0.04, draw: (a, t) => keyClick(a, t, 'enter') },

  /* Mouse, switches and the 3D monitor */
  mouseDown: {
    n: 3,
    len: 0.05,
    jitter: 0.05,
    draw: (a, t) => {
      noise(a, t, { freq: 4200, q: 3, peak: 0.5, attack: 0.001, decay: 0.008 });
      tone(a, t, { type: 'triangle', freq: 2400, peak: 0.05, attack: 0.001, decay: 0.006 });
    },
  },
  mouseUp: { n: 3, len: 0.05, jitter: 0.05, draw: (a, t) => noise(a, t, { freq: 3500, q: 3, peak: 0.28, attack: 0.001, decay: 0.006 }) },
  hover: { n: 3, len: 0.03, jitter: 0.08, draw: (a, t) => noise(a, t, { freq: 6500, q: 4, peak: 0.14, attack: 0.001, decay: 0.004 }) },
  toggleOn: {
    len: 0.1,
    draw: (a, t) => {
      noise(a, t, { freq: 2600, q: 2, peak: 0.45, attack: 0.001, decay: 0.01 });
      noise(a, t + 0.035, { freq: 4200, q: 2, peak: 0.3, attack: 0.001, decay: 0.008 });
    },
  },
  toggleOff: {
    len: 0.1,
    draw: (a, t) => {
      noise(a, t, { freq: 4200, q: 2, peak: 0.3, attack: 0.001, decay: 0.008 });
      noise(a, t + 0.035, { freq: 2600, q: 2, peak: 0.45, attack: 0.001, decay: 0.01 });
    },
  },
  knob: {
    n: 3,
    len: 0.04,
    jitter: 0.04,
    draw: (a, t) => {
      noise(a, t, { freq: 5200, q: 3, peak: 0.32, attack: 0.001, decay: 0.005 });
      tone(a, t, { type: 'square', freq: 1400, peak: 0.02, attack: 0.001, decay: 0.008 });
    },
  },
  settle: {
    n: 2,
    len: 0.15,
    jitter: 0.05,
    draw: (a, t) => {
      tone(a, t, { freq: 180, to: 120, peak: 0.22, decay: 0.07 });
      noise(a, t, { freq: 900, q: 1, peak: 0.14, attack: 0.001, decay: 0.02 });
    },
  },
  whooshIn: { len: 0.7, draw: (a, t) => noise(a, t, { freq: 300, to: 2600, q: 1.2, peak: 0.4, attack: 0.2, decay: 0.4 }) },
  whooshOut: { len: 0.7, draw: (a, t) => noise(a, t, { freq: 2600, to: 300, q: 1.2, peak: 0.4, attack: 0.15, decay: 0.45 }) },

  /* Terminal */
  /** Hard drive reading: a seek burst and some ticks. */
  seek: {
    n: 3,
    len: 0.4,
    draw: (a, t) => {
      for (let i = 0; i < 5; i++) noise(a, t + i * 0.012, { freq: 1400, q: 4, peak: 0.4, attack: 0.001, decay: 0.008 });
      for (let i = 0; i < 8; i++) {
        noise(a, t + 0.08 + Math.random() * 0.25, { freq: 4800, q: 2, peak: 0.25, attack: 0.001, decay: 0.006 });
      }
    },
  },
  /** CLS: static wiping down the glass. */
  wipe: { len: 0.45, draw: (a, t) => noise(a, t, { type: 'highpass', freq: 6000, to: 700, peak: 0.16, attack: 0.01, decay: 0.35 }) },
  /** An image painting in, 14 steps over 700 ms (matches tty-scan-in). */
  scan: {
    len: 0.85,
    draw: (a, t) => {
      for (let i = 0; i < 14; i++) {
        noise(a, t + i * 0.05, { freq: 1500 + i * 150, q: 6, peak: 0.35, attack: 0.001, decay: 0.025 });
      }
      held(a, t, 0.7, 7800, 0.006);
    },
  },
  open: { len: 0.15, draw: (a, t) => notes(a, t, [880, 1320], 0.045, 0.07) },
  close: { len: 0.15, draw: (a, t) => notes(a, t, [1320, 880], 0.045, 0.07) },

  /* Games */
  start: { len: 0.2, draw: (a, t) => notes(a, t, [523, 784], 0.06) },
  paddle: { len: 0.12, draw: (a, t) => tone(a, t, sq(459, 0.07)) },
  wall: { len: 0.08, draw: (a, t) => tone(a, t, sq(226, 0.035)) },
  point: { len: 0.35, draw: (a, t) => tone(a, t, sq(490, 0.26)) },
  win: { len: 0.8, draw: (a, t) => notes(a, t, [523, 659, 784, 1047], 0.09, 0.09, 0.35) },
  lose: { len: 0.9, draw: (a, t) => notes(a, t, [392, 330, 262, 196], 0.13, 0.09, 0.4) },
  best: { len: 1, draw: (a, t) => notes(a, t, [784, 988, 1175, 1568, 1175, 1568], 0.08, 0.08, 0.35) },
  eat: { len: 0.15, draw: (a, t) => notes(a, t, [700, 1050], 0.035, 0.09) },
  die: {
    len: 0.6,
    draw: (a, t) => {
      noise(a, t, { type: 'lowpass', freq: 1500, peak: 0.28, attack: 0.002, decay: 0.35 });
      tone(a, t, sq(330, 0.4, 0.06, 55));
    },
  },
  brick: { len: 0.1, draw: (a, t) => tone(a, t, sq(640, 0.05)) },
  life: { len: 0.5, draw: (a, t) => tone(a, t, sq(520, 0.4, 0.06, 90)) },
  move: { len: 0.04, draw: (a, t) => tone(a, t, sq(320, 0.012, 0.05)) },
  rotate: { len: 0.07, draw: (a, t) => tone(a, t, sq(520, 0.035, 0.05, 780)) },
  softDrop: { len: 0.04, draw: (a, t) => tone(a, t, sq(200, 0.01, 0.04)) },
  lock: {
    len: 0.12,
    draw: (a, t) => {
      tone(a, t, { freq: 150, to: 60, peak: 0.3, decay: 0.07 });
      noise(a, t, { type: 'lowpass', freq: 800, peak: 0.2, attack: 0.001, decay: 0.04 });
    },
  },
  hardDrop: {
    len: 0.2,
    draw: (a, t) => {
      noise(a, t, { type: 'lowpass', freq: 1200, peak: 0.35, attack: 0.001, decay: 0.08 });
      tone(a, t, { freq: 110, to: 40, peak: 0.4, decay: 0.12 });
    },
  },
  clear: { len: 0.3, draw: (a, t) => tone(a, t, sq(400, 0.22, 0.06, 1600)) },
  tetris: {
    len: 0.8,
    draw: (a, t) => {
      notes(a, t, [523, 659, 784, 1047, 1319], 0.06, 0.09, 0.3);
      tone(a, t, sq(300, 0.5, 0.03, 2000));
    },
  },
  hold: { len: 0.1, draw: (a, t) => notes(a, t, [600, 450], 0.035, 0.08) },
  shoot: { len: 0.18, jitter: 0.03, draw: (a, t) => tone(a, t, sq(1400, 0.14, 0.05, 180)) },
  boom: {
    len: 0.25,
    jitter: 0.06,
    draw: (a, t) => {
      noise(a, t, { freq: 1200, to: 300, q: 0.7, peak: 0.35, attack: 0.001, decay: 0.18 });
      tone(a, t, sq(200, 0.15, 0.04, 60));
    },
  },
  hit: {
    len: 0.8,
    draw: (a, t) => {
      noise(a, t, { type: 'lowpass', freq: 900, to: 200, peak: 0.45, attack: 0.002, decay: 0.6 });
      tone(a, t, { freq: 80, to: 30, peak: 0.4, decay: 0.5 });
    },
  },
  /** One note of the invaders' marching bass (pitch it with `rate`). */
  march: { len: 0.15, draw: (a, t) => tone(a, t, { type: 'square', freq: 110, peak: 0.12, attack: 0.002, decay: 0.09, lowpass: 700 }) },
  modem: { len: 4.3, draw: modem },
  tada: { len: 1, draw: (a, t) => notes(a, t, [523, 659, 784, 1047, 784, 1047], 0.07, 0.08, 0.4) },
} satisfies Record<string, Sample>;

export type SfxName = keyof typeof SAMPLES;

/**
 * Play a short sound effect now. `rate` changes its pitch (2 = an octave up).
 */
export function sfx(name: SfxName, opts: { rate?: number } = {}): void {
  if (import.meta.env.DEV) ((host() as AudioHost & { __sfxLog?: string[] }).__sfxLog ??= []).push(name);
  const a = live();
  if (!a) return;
  const sample: Sample = SAMPLES[name];
  const set = a.bank && a.bank !== 'building' ? a.bank[name] : undefined;
  if (set?.length) {
    const src = a.ctx.createBufferSource();
    src.buffer = set[Math.floor(Math.random() * set.length)];
    const wobble = sample.jitter ? 1 + (Math.random() * 2 - 1) * sample.jitter : 1;
    src.playbackRate.value = (opts.rate ?? 1) * wobble;
    src.connect(a.master);
    src.start(); // right now — nothing scheduled that could be missed
    return;
  }
  sample.draw(a, a.ctx.currentTime + LEAD);
}

/** Render every sample's variations once, offline. */
function buildBank(a: CrtAudio) {
  const Offline = host().OfflineAudioContext ?? window.OfflineAudioContext;
  if (!Offline) return;
  a.bank = 'building';
  const sr = a.ctx.sampleRate;
  const render = (sample: Sample) => {
    const off = new Offline(1, Math.ceil(sr * sample.len), sr);
    const master = off.createGain();
    master.connect(off.destination);
    sample.draw({ ctx: off, master, noise: a.noise, unlocked: true, hum: null }, 0.001);
    return off.startRendering();
  };
  const entries = Object.entries(SAMPLES) as [SfxName, Sample][];
  Promise.all(entries.map(([, s]) => Promise.all(Array.from({ length: s.n ?? 1 }, () => render(s)))))
    .then((rendered) => {
      a.bank = Object.fromEntries(entries.map(([name], i) => [name, rendered[i]]));
    })
    .catch(() => {
      a.bank = undefined;
    });
}

/* ── Pointer sounds ───────────────────────────────────────────────────── */

const CLICKABLE = 'button, a, [role="button"], [role="switch"], .tty-thumb';

/**
 * Mouse-button clicks for every click in this document, and a faint tick
 * when the pointer moves onto something clickable. Returns a cleanup.
 */
export function installPointerSounds(doc: Document = document): () => void {
  let over: Element | null = null;
  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button === 0) sfx('mouseDown');
  };
  const up = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button === 0) sfx('mouseUp');
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = (e.target as Element | null)?.closest?.(CLICKABLE) ?? null;
    if (el && el !== over) sfx('hover');
    over = el;
  };
  doc.addEventListener('pointerdown', down, true);
  doc.addEventListener('pointerup', up, true);
  doc.addEventListener('pointerover', move, true);
  return () => {
    doc.removeEventListener('pointerdown', down, true);
    doc.removeEventListener('pointerup', up, true);
    doc.removeEventListener('pointerover', move, true);
  };
}
