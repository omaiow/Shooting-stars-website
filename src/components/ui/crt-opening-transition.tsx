import { useEffect, useRef, type RefObject } from 'react';

interface CrtOpeningTransitionProps {
  contentRef: RefObject<HTMLDivElement | null>;
  onComplete: () => void;
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function backOut(progress: number) {
  const amount = 1.9;
  const shifted = progress - 1;
  return 1 + (amount + 1) * shifted ** 3 + amount * shifted ** 2;
}

export function CrtOpeningTransition({
  contentRef,
  onComplete,
}: CrtOpeningTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const overlay = overlayRef.current;
    const blackout = blackoutRef.current;
    const beam = beamRef.current;

    if (!content || !overlay || !blackout || !beam) {
      console.error('Unable to start CRT opening: required elements are missing.');
      onComplete();
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    if (reducedMotionQuery.matches) {
      onComplete();
      return;
    }

    const originalStyles = {
      filter: content.style.filter,
      transform: content.style.transform,
      transformOrigin: content.style.transformOrigin,
      visibility: content.style.visibility,
      willChange: content.style.willChange,
    };
    let animationFrame = 0;
    let previousTime = performance.now();
    let elapsed = 0;
    let finished = false;

    content.style.visibility = 'visible';
    content.style.transformOrigin = '50% 50vh';
    content.style.transform = 'scale3d(1, 0.001, 1)';
    content.style.filter = 'brightness(2.8) saturate(0) contrast(1.45)';
    content.style.willChange = 'transform, filter';

    const restoreContentStyles = () => {
      content.style.filter = originalStyles.filter;
      content.style.transform = originalStyles.transform;
      content.style.transformOrigin = originalStyles.transformOrigin;
      content.style.visibility = originalStyles.visibility;
      content.style.willChange = originalStyles.willChange;
    };

    const finishPowerOn = () => {
      if (finished) return;
      finished = true;
      window.cancelAnimationFrame(animationFrame);
      overlay.style.display = 'none';
      restoreContentStyles();
      onComplete();
    };

    const drawPowerOn = (now: number) => {
      if (document.hidden) return;

      elapsed += Math.min(Math.max((now - previousTime) / 1000, 0), 0.05);
      previousTime = now;

      if (elapsed < 0.12) {
        blackout.style.display = 'block';
        beam.style.display = 'none';
      } else if (elapsed < 0.26) {
        const beamTime = elapsed - 0.12;
        const jitter = Math.sin(beamTime * 235) * 0.9;
        const widthWobble = 1 + Math.sin(beamTime * 91) * 0.004;
        blackout.style.display = 'block';
        beam.style.display = 'block';
        beam.style.transform = `translate3d(${jitter}px, -50%, 0) scaleX(${widthWobble})`;
      } else if (elapsed < 0.48) {
        const progress = clamp01((elapsed - 0.26) / 0.22);
        const verticalScale = Math.max(backOut(progress), 0.001);
        const brightness = 2.8 - progress * 0.55;
        const saturation = 0.03 + progress * 0.09;
        const contrast = 1.45 - progress * 0.08;
        blackout.style.display = 'none';
        beam.style.display = elapsed < 0.295 ? 'block' : 'none';
        content.style.transform = `scale3d(1, ${verticalScale}, 1)`;
        content.style.filter = `brightness(${brightness}) saturate(${saturation}) contrast(${contrast})`;
      } else if (elapsed < 0.7) {
        const progress = clamp01((elapsed - 0.48) / 0.22);
        const decay = 1 - progress;
        const horizontalScale =
          1 + Math.sin(progress * Math.PI * 5) * 0.026 * decay;
        const brightness = 1 + 1.25 * decay;
        const saturation = 1 - 0.88 * decay;
        const contrast = 1 + 0.37 * decay;
        blackout.style.display = 'none';
        beam.style.display = 'none';
        content.style.transform = `scale3d(${horizontalScale}, 1, 1)`;
        content.style.filter = `brightness(${brightness}) saturate(${saturation}) contrast(${contrast})`;
      } else {
        finishPowerOn();
        return;
      }

      animationFrame = window.requestAnimationFrame(drawPowerOn);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
        return;
      }
      previousTime = performance.now();
      animationFrame = window.requestAnimationFrame(drawPowerOn);
    };
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) finishPowerOn();
    };

    animationFrame = window.requestAnimationFrame(drawPowerOn);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      restoreContentStyles();
    };
  }, [contentRef, onComplete]);

  return (
    <div ref={overlayRef} className="crt-power-overlay" aria-hidden="true">
      <div ref={blackoutRef} className="crt-power-blackout" />
      <div ref={beamRef} className="crt-power-beam" />
    </div>
  );
}
