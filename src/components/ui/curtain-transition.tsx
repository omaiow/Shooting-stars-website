import { useEffect, useState } from 'react';

interface CurtainTransitionProps {
  onComplete?: () => void;
}

export function CurtainTransition({ onComplete }: CurtainTransitionProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true);
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (done) return null;

  return (
    <div className="curtain-wrapper" aria-hidden="true">
      <div className="curtain-panel curtain-top" />
      <div className="curtain-panel curtain-bottom" />
    </div>
  );
}
