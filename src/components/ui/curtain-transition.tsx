import { useEffect, useState } from 'react';

interface CurtainTransitionProps {
  onMidpoint?: () => void;
  onComplete?: () => void;
}

export function CurtainTransition({ onMidpoint, onComplete }: CurtainTransitionProps) {
  const [phase, setPhase] = useState<'closing' | 'opening' | 'done'>('closing');

  useEffect(() => {
    // 1. Horizontal closing animation takes 800ms. Wait a bit for pure black screen.
    const t1 = setTimeout(() => {
      onMidpoint?.();
      setPhase('opening');
    }, 1000);

    // 2. Vertical opening animation takes 1200ms.
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onMidpoint, onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="curtain-wrapper" aria-hidden="true" style={{ pointerEvents: 'auto' }}>
      {phase === 'closing' && (
        <>
          <div className="curtain-panel curtain-left" />
          <div className="curtain-panel curtain-right" />
        </>
      )}
      {phase === 'opening' && (
        <>
          <div className="curtain-panel curtain-top-open" />
          <div className="curtain-panel curtain-bottom-open" />
        </>
      )}
    </div>
  );
}
