import { useCallback, useEffect, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

/**
 * AsciiSpline — renders a Spline scene and redraws it as ASCII characters.
 *
 * The Spline canvas stays in the page (invisible but still interactive, so
 * the scene's own hover/mouse effects keep working). Its frames are captured
 * as a video stream, shrunk to one pixel per character cell, and each cell's
 * brightness picks a glyph from the ramp below.
 */

// Dark → bright. A leading space keeps the empty background clean.
const RAMP = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

interface AsciiSplineProps {
  scene: string;
  /** Character size in CSS px. Smaller = more detail, more work. */
  fontSize?: number;
  /** Phosphor colour of the characters. */
  color?: string;
  /** Frames per second for the ASCII pass. */
  fps?: number;
  /** Part of the scene to show, as a fraction of its width/height around the centre (1 = all). */
  crop?: number;
  className?: string;
}

export function AsciiSpline({
  scene,
  fontSize = 9,
  color = '#7dff8a',
  fps = 30,
  crop = 1,
  className,
}: AsciiSplineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLCanvasElement>(null);
  const srcCanvas = useRef<HTMLCanvasElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  const handleLoad = useCallback((app: Application) => {
    srcCanvas.current = app.canvas;
    setReady(true);
    // A live video stream of the WebGL/WebGPU canvas is the reliable way to
    // read its pixels back (drawing the canvas directly can come back blank).
    const capture = (app.canvas as HTMLCanvasElement & {
      captureStream?: (fps?: number) => MediaStream;
    }).captureStream;
    if (capture) {
      const v = document.createElement('video');
      v.muted = true;
      v.playsInline = true;
      v.srcObject = capture.call(app.canvas, fps);
      v.play().catch(() => {});
      video.current = v;
    }
  }, [fps]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const out = outRef.current;
    if (!wrap || !out) return;
    const ctx = out.getContext('2d');
    const sample = document.createElement('canvas');
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    if (!ctx || !sctx) return;

    const font = `${fontSize}px "VT323", "JetBrains Mono", ui-monospace, monospace`;
    let cols = 0;
    let rows = 0;
    let cellW = fontSize * 0.5;
    const lineH = fontSize;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      out.width = Math.max(1, Math.round(w * dpr));
      out.height = Math.max(1, Math.round(h * dpr));
      out.style.width = `${w}px`;
      out.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;
      cellW = ctx.measureText('M').width || fontSize * 0.5;
      cols = Math.max(1, Math.floor(w / cellW));
      rows = Math.max(1, Math.floor(h / lineH));
      sample.width = cols;
      sample.height = rows;
    };

    document.fonts?.load(font).finally(layout);
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);

    let raf = 0;
    let last = 0;
    const frameMs = 1000 / fps;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < frameMs) return;
      last = now;

      const source: CanvasImageSource | null =
        video.current && video.current.readyState >= 2 ? video.current : srcCanvas.current;
      if (!source) return;

      const sw = source instanceof HTMLVideoElement ? source.videoWidth : (source as HTMLCanvasElement).width;
      const sh = source instanceof HTMLVideoElement ? source.videoHeight : (source as HTMLCanvasElement).height;
      if (!sw || !sh) return;
      // Crop around the centre, keeping the output's aspect ratio.
      const outAspect = (cols * cellW) / (rows * lineH);
      let cw = sw * crop;
      let ch = cw / outAspect;
      if (ch > sh * crop) {
        ch = sh * crop;
        cw = ch * outAspect;
      }
      try {
        sctx.drawImage(source, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, cols, rows);
      } catch {
        return;
      }
      const { data } = sctx.getImageData(0, 0, cols, rows);

      ctx.clearRect(0, 0, out.width, out.height);
      ctx.font = font;
      ctx.textBaseline = 'top';
      ctx.fillStyle = color;
      const maxIdx = RAMP.length - 1;
      for (let y = 0; y < rows; y++) {
        let line = '';
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          // Perceived brightness, with a little gamma lift for the dark scene.
          const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
          line += RAMP[Math.min(maxIdx, Math.round(Math.pow(lum, 0.75) * maxIdx))];
        }
        ctx.fillText(line, 0, y * lineH);
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [fontSize, color, fps, crop]);

  useEffect(
    () => () => {
      const v = video.current;
      const stream = v?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      if (v) v.srcObject = null;
    },
    [],
  );

  return (
    <div ref={wrapRef} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* The real scene: invisible, but still receives the mouse */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0 }}>
        <Spline scene={scene} onLoad={handleLoad} style={{ width: '100%', height: '100%' }} />
      </div>
      {!ready && (
        <div
          className="tty-dim"
          style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
        >
          RENDERING OMAI.3D …
        </div>
      )}
      <canvas
        ref={outRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          filter: `drop-shadow(0 0 3px ${color}aa)`,
        }}
      />
    </div>
  );
}
