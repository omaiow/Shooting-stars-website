import { useCallback, useEffect, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application, SPEObject } from '@splinetool/runtime';
import { CRT_SCENE_URL } from './crt-config';
import { crtLightFlicker, setSteadyLight, useSteadyLight } from './crt-flicker';
import {
  orbitPose,
  project,
  rectToQuad,
  toMatrix3d,
  unproject,
  type CameraPose,
  type Vec2,
  type Vec3,
} from './crt-math';

/**
 * CrtFrame — the 3D retro computer (a Spline scene) with the real website
 * running on its screen.
 *
 * - The screen shows the terminal UI in an iframe at `/?tty`; "Full screen"
 *   opens the original site at `/?screen`. The iframe stays fully clickable.
 * - Drag anywhere outside the screen to orbit the computer; let go and the
 *   camera springs back to the straight-on view. Scroll (outside the screen)
 *   or double-click to zoom in on the screen.
 * - Every frame we drive the Spline camera ourselves and warp the iframe with
 *   a CSS matrix3d so it stays glued to the glass at any angle.
 */

/* ── Scene geometry (world units, must match the Spline file) ─────────── */
const CAMERA_NAME = 'CRT Camera';
/** Front face of the screen glass: the website is mapped onto this rectangle. */
const GLASS = { left: 724, right: 1076, bottom: 218, top: 482, z: 186 };
/** Front edge of the bezel opening: anything behind it is hidden at an angle. */
const OPENING = { left: 722, right: 1078, bottom: 216, top: 484, z: 208 };
/** Straight-on view of the whole computer, and the zoomed-in view of the screen. */
const VIEW_WIDE = { target: { x: 900, y: 320, z: 186 }, distance: 820 };
const VIEW_CLOSE = { target: { x: 900, y: 350, z: 186 }, distance: 420 };
/** Front face of the 3D power button on the base unit (clickable). */
const POWER_BUTTON = { left: 1068, right: 1124, bottom: 38, top: 78, z: 228 };
/** Lights that come from the screen: they flicker with the tube and go dark when off. */
const SCREEN_LIGHTS = ['Screen Glow', 'Screen Spill Low', 'Recess Warm Bounce'];
/** The power LED's glow: steady — simply on or off with the power, never flickers. */
const LED_LIGHT = 'Power LED Glow';
/** The glowing LED on the power button; hidden while the set is off. */
const POWER_LED_NAME = 'PC Power LED';
/** Opening shot: start far off in the dark, glide in, then power on. */
const INTRO = { distance: 2600, yaw: -0.22, pitch: 0.2, ms: 3200, fadeMs: 1600 };
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** How long the switch-off collapse plays before the site is unloaded (ms). */
const POWER_OFF_MS = 650;

/* ── Feel ─────────────────────────────────────────────────────────────── */
const MAX_YAW = (28 * Math.PI) / 180;
const MAX_PITCH = (16 * Math.PI) / 180;
const DRAG_SPEED = 0.0045; // radians per pixel dragged
const SPRING = 55; // snap-back stiffness
const DAMPING = 11; // snap-back damping (lower = more wobble)

/** Width the site is laid out at before being scaled onto the glass. */
const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = Math.round(
  (VIRTUAL_WIDTH * (GLASS.top - GLASS.bottom)) / (GLASS.right - GLASS.left),
);

const STAGE_BG = '#262626';

function readNumberParam(name: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const v = Number(new URLSearchParams(window.location.search).get(name));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// The Spline camera's vertical field of view. Spline's default is 45°.
// Tune live with ?fov=50 if the site doesn't sit exactly on the glass.
const CAMERA_FOV = readNumberParam('fov', 45);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
});
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Is point p inside the convex quad q (any winding)? */
function insideQuad(p: Vec2, q: Vec2[]): boolean {
  let sign = 0;
  for (let i = 0; i < q.length; i++) {
    const a = q[i];
    const b = q[(i + 1) % q.length];
    const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (cross !== 0) {
      if (sign === 0) sign = Math.sign(cross);
      else if (Math.sign(cross) !== sign) return false;
    }
  }
  return true;
}

export function CrtFrame() {
  const stageRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const camRef = useRef<SPEObject | null>(null);
  const [siteReady, setSiteReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [showHint, setShowHint] = useState(true);
  // Power: `powered` mounts the site; `switchingOff` plays the collapse first.
  // The set starts switched off; the opening shot turns it on.
  const [powered, setPowered] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const steadyLight = useSteadyLight();
  const intro = useRef<{ start: number | null; done: boolean }>({ start: null, done: false });
  const darknessRef = useRef<HTMLDivElement>(null);
  const powerOnRef = useRef<() => void>(() => {});
  const [switchingOff, setSwitchingOff] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const poweredRef = useRef(false);
  const offTimer = useRef<number | undefined>(undefined);
  // Screen lights: their authored intensities, so we can fade them and restore.
  const lightsRef = useRef<{ obj: SPEObject; base: number }[]>([]);
  const ledRef = useRef<SPEObject | null>(null);
  const ledLightRef = useRef<{ obj: SPEObject; base: number } | null>(null);
  const powerLevel = useRef(0);
  // Last camera pose + stage size, for hit-testing the 3D power button.
  const lastView = useRef<{ pose: CameraPose; W: number; H: number } | null>(null);
  const debug =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('crt-debug');

  // Motion state lives in a ref: it changes every frame, React doesn't need it.
  const motion = useRef({
    yaw: 0,
    pitch: 0,
    vYaw: 0,
    vPitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    zoom: 0, // 0 = whole computer, 1 = screen fills the view
    zoomTarget: 0,
  });

  const handleLoad = useCallback((app: Application) => {
    appRef.current = app;
    // Dev only: expose the scene for poking at it from the console.
    if (import.meta.env.DEV) (window as unknown as { __crtApp?: Application }).__crtApp = app;
    camRef.current = app.findObjectByName(CAMERA_NAME) ?? null;
    if (!camRef.current) {
      console.warn(`CRT frame: no camera named "${CAMERA_NAME}" in the scene.`);
    }
    lightsRef.current = SCREEN_LIGHTS.flatMap((name) => {
      const obj = app.findObjectByName(name);
      return obj ? [{ obj, base: obj.intensity }] : [];
    });
    ledRef.current = app.findObjectByName(POWER_LED_NAME) ?? null;
    const ledLight = app.findObjectByName(LED_LIGHT);
    ledLightRef.current = ledLight ? { obj: ledLight, base: ledLight.intensity } : null;
    if (ledLight) ledLight.intensity = 0;
    // Start dark: screen lights and LED off until the opening shot powers on.
    for (const l of lightsRef.current) l.obj.intensity = 0;
    if (ledRef.current) ledRef.current.visible = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      intro.current.done = true;
      setIntroDone(true);
      powerOnRef.current();
    } else {
      intro.current.start = performance.now();
    }
    setSceneReady(true);
  }, []);

  // Per-frame loop: spring physics → camera pose → site plane transform.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const m = motion.current;

      if (!m.dragging) {
        // Damped spring back to the straight-on view.
        m.vYaw += (-SPRING * m.yaw - DAMPING * m.vYaw) * dt;
        m.vPitch += (-SPRING * m.pitch - DAMPING * m.vPitch) * dt;
        m.yaw += m.vYaw * dt;
        m.pitch += m.vPitch * dt;
        if (reduceMotion.matches) {
          m.yaw = m.pitch = m.vYaw = m.vPitch = 0;
        }
      }
      m.zoom += (m.zoomTarget - m.zoom) * Math.min(1, dt * (reduceMotion.matches ? 60 : 6));

      const z = easeInOut(clamp(m.zoom, 0, 1));
      let pose = orbitPose(
        lerp3(VIEW_WIDE.target, VIEW_CLOSE.target, z),
        lerp(VIEW_WIDE.distance, VIEW_CLOSE.distance, z),
        m.yaw,
        m.pitch,
      );

      // Opening shot: out of the darkness, glide in onto the monitor, then power on.
      const it = intro.current;
      if (!it.done && it.start != null) {
        const t = clamp((now - it.start) / INTRO.ms, 0, 1);
        const e = easeInOutCubic(t);
        pose = orbitPose(
          VIEW_WIDE.target,
          lerp(INTRO.distance, VIEW_WIDE.distance, e),
          lerp(INTRO.yaw, 0, e),
          lerp(INTRO.pitch, 0, e),
        );
        const dark = darknessRef.current;
        if (dark) dark.style.opacity = String(1 - easeInOut(clamp((now - it.start) / INTRO.fadeMs, 0, 1)));
        if (t >= 1) {
          it.done = true;
          if (dark) dark.style.opacity = '0';
          setIntroDone(true);
          powerOnRef.current();
        }
      }

      // Screen lights follow the power state: snap off, flicker back on.
      const target = poweredRef.current ? 1 : 0;
      const prev = powerLevel.current;
      // Ramp toward the target and hold there (an "else fall" here made a
      // fully-on light keep dropping and re-warming, i.e. flicker forever).
      if (target > prev) powerLevel.current = Math.min(1, prev + dt * 1.6);
      else if (target < prev) powerLevel.current = Math.max(0, prev - dt * 7);
      const level = powerLevel.current;
      if (level > 0 || level !== prev) {
        // Warm-up stutter while powering on, then the same tube flicker the
        // terminal shows (crt-flicker.ts is clock-based, so they stay in sync).
        const warmup = level > 0 && level < 1 && target === 1 ? 0.6 + 0.4 * Math.random() : 1;
        const tube = reduceMotion.matches ? 1 : crtLightFlicker();
        for (const l of lightsRef.current) {
          const v = l.base * level * warmup * tube;
          // Only touch the light when its value actually changes.
          if (Math.abs(l.obj.intensity - v) > 1e-4) l.obj.intensity = v;
        }
      }

      const cam = camRef.current;
      if (cam) {
        cam.position.x = pose.position.x;
        cam.position.y = pose.position.y;
        cam.position.z = pose.position.z;
        cam.rotation.x = pose.euler.x;
        cam.rotation.y = pose.euler.y;
        cam.rotation.z = pose.euler.z;
      }

      const stage = stageRef.current;
      const plane = planeRef.current;
      if (stage && plane) {
        const W = stage.clientWidth;
        const H = stage.clientHeight;
        lastView.current = { pose, W, H };
        const p = (x: number, y: number, zz: number) =>
          project({ x, y, z: zz }, pose, CAMERA_FOV, W, H);

        const quad = [
          p(GLASS.left, GLASS.top, GLASS.z),
          p(GLASS.right, GLASS.top, GLASS.z),
          p(GLASS.right, GLASS.bottom, GLASS.z),
          p(GLASS.left, GLASS.bottom, GLASS.z),
        ] as const;
        const h = rectToQuad(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, [...quad]);
        plane.style.transform = toMatrix3d(h);

        // Hide whatever part of the screen the bezel edge covers at this angle.
        const edge = [
          p(OPENING.left, OPENING.top, OPENING.z),
          p(OPENING.right, OPENING.top, OPENING.z),
          p(OPENING.right, OPENING.bottom, OPENING.z),
          p(OPENING.left, OPENING.bottom, OPENING.z),
        ].map((pt) => unproject(h, pt));
        plane.style.clipPath = `polygon(${edge
          .map((pt) => `${pt.x.toFixed(1)}px ${pt.y.toFixed(1)}px`)
          .join(',')})`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => () => window.clearTimeout(offTimer.current), []);

  const setPower = useCallback((on: boolean) => {
    if (poweredRef.current === on) return;
    poweredRef.current = on;
    window.clearTimeout(offTimer.current);
    if (ledRef.current) ledRef.current.visible = on;
    const led = ledLightRef.current;
    if (led) led.obj.intensity = on ? led.base : 0;
    if (on) {
      // Fresh load: the site plays its own power-on beam again.
      setSwitchingOff(false);
      setSiteReady(false);
      setIframeKey((k) => k + 1);
      setPowered(true);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setSwitchingOff(true);
    // Unload the site after the collapse so videos/audio stop too.
    offTimer.current = window.setTimeout(() => {
      setPowered(false);
      setSwitchingOff(false);
    }, reduce ? 0 : POWER_OFF_MS);
  }, []);
  const togglePower = useCallback(() => setPower(!poweredRef.current), [setPower]);
  useEffect(() => {
    powerOnRef.current = () => setPower(true);
  }, [setPower]);

  /** Jump straight to the end of the opening shot. */
  const skipIntro = () => {
    const it = intro.current;
    if (it.done || it.start == null) return false;
    it.start = performance.now() - INTRO.ms;
    return true;
  };

  /** Is the pointer over the 3D power button? */
  const overPowerButton = (clientX: number, clientY: number) => {
    const v = lastView.current;
    const stage = stageRef.current;
    if (!v || !stage) return false;
    const r = stage.getBoundingClientRect();
    const pt = { x: clientX - r.left, y: clientY - r.top };
    const b = POWER_BUTTON;
    const q = [
      project({ x: b.left, y: b.top, z: b.z }, v.pose, CAMERA_FOV, v.W, v.H),
      project({ x: b.right, y: b.top, z: b.z }, v.pose, CAMERA_FOV, v.W, v.H),
      project({ x: b.right, y: b.bottom, z: b.z }, v.pose, CAMERA_FOV, v.W, v.H),
      project({ x: b.left, y: b.bottom, z: b.z }, v.pose, CAMERA_FOV, v.W, v.H),
    ];
    return insideQuad(pt, q);
  };

  // Drag-to-orbit on everything except the screen (the iframe eats its own events).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (skipIntro()) return;
    if (overPowerButton(e.clientX, e.clientY)) {
      togglePower();
      return;
    }
    const m = motion.current;
    m.dragging = true;
    m.lastX = e.clientX;
    m.lastY = e.clientY;
    m.vYaw = m.vPitch = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    setShowHint(false);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const m = motion.current;
    if (!m.dragging) {
      e.currentTarget.style.cursor = overPowerButton(e.clientX, e.clientY) ? 'pointer' : 'grab';
      return;
    }
    const dx = e.clientX - m.lastX;
    const dy = e.clientY - m.lastY;
    m.lastX = e.clientX;
    m.lastY = e.clientY;
    // Rubber-band near the limits so it never hits a hard wall.
    const give = (v: number, max: number) => 1 - Math.min(Math.abs(v) / max, 1) ** 2;
    m.yaw = clamp(m.yaw - dx * DRAG_SPEED * give(m.yaw, MAX_YAW), -MAX_YAW, MAX_YAW);
    m.pitch = clamp(m.pitch + dy * DRAG_SPEED * give(m.pitch, MAX_PITCH), -MAX_PITCH, MAX_PITCH);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    motion.current.dragging = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const m = motion.current;
    m.zoomTarget = clamp(m.zoomTarget - e.deltaY * 0.0015, 0, 1);
    setShowHint(false);
  };
  const toggleZoom = () => {
    const m = motion.current;
    m.zoomTarget = m.zoomTarget > 0.5 ? 0 : 1;
    setShowHint(false);
  };

  return (
    <div
      ref={stageRef}
      className="crt-frame-root"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
      onDoubleClick={toggleZoom}
      style={{
        position: 'fixed',
        inset: 0,
        background: STAGE_BG,
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {/* The 3D computer — rendered only, never takes the pointer itself */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Spline
          scene={CRT_SCENE_URL}
          onLoad={handleLoad}
          renderOnDemand={false}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* The website, warped onto the glass every frame */}
      <div
        ref={planeRef}
        className="crt-screen-plane"
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${VIRTUAL_WIDTH}px`,
          height: `${VIRTUAL_HEIGHT}px`,
          transformOrigin: '0 0',
          willChange: 'transform',
          visibility: sceneReady ? 'visible' : 'hidden',
          cursor: 'auto',
          background: '#000',
          outline: debug ? '4px solid #ff2e63' : undefined,
        }}
      >
        <div
          className={`crt-tube${switchingOff ? ' crt-tube-off' : siteReady && powered ? ' crt-tube-on' : ''}`}
        >
          {powered && (
            <iframe
              key={iframeKey}
              src="/?tty"
              title="Shaun Sia — Omai portfolio"
              onLoad={() => setSiteReady(true)}
              style={{
                width: '100%',
                height: '100%',
                border: 0,
                display: 'block',
                opacity: siteReady ? (debug ? 0.6 : 1) : 0,
                transition: 'opacity 400ms ease',
                background: '#030712',
              }}
            />
          )}
        </div>
        {!powered && <div className="crt-afterglow" aria-hidden="true" />}
        <div className="crt-glass-overlay" aria-hidden="true" />
      </div>

      <div className="crt-controls">
        <button
          type="button"
          aria-pressed={powered && !switchingOff}
          onClick={togglePower}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Power {powered && !switchingOff ? 'off' : 'on'}
        </button>
        <button type="button" onClick={toggleZoom} onPointerDown={(e) => e.stopPropagation()}>
          Zoom screen
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={!steadyLight}
          className="crt-switch"
          onClick={() => setSteadyLight(!steadyLight)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Light flicker
          <span className="crt-switch-track" aria-hidden="true">
            <span className="crt-switch-thumb" />
          </span>
        </button>
        <a href="/?screen" onPointerDown={(e) => e.stopPropagation()}>
          Full screen ↗
        </a>
      </div>

      {/* Opening darkness, faded out by the per-frame loop */}
      {!introDone && (
        <div
          ref={darknessRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, background: '#000', pointerEvents: 'none' }}
        />
      )}

      {showHint && introDone && (
        <div className="crt-hint" aria-hidden="true">
          Drag to look around · scroll to zoom
        </div>
      )}
    </div>
  );
}
