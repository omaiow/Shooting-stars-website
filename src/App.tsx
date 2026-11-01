import { useState, useCallback, useRef, useEffect } from 'react';
import { MainSite } from './components/portfolio/MainSite';
import { CrtOpeningTransition } from './components/ui/crt-opening-transition';
import { CrtScreenEffect } from './components/ui/crt-screen-effect';
import { CrtFrame } from './components/crt/CrtFrame';
import { crtGpuAvailable, shouldUseCrtFrame } from './components/crt/crt-config';
import { CrtErrorBoundary } from './components/crt/CrtErrorBoundary';

// Decided once per page load: big desktop screens get the 3D CRT with the site
// inside it (the site itself is loaded at /?screen); phones, tablets and
// /?screen get the site directly, exactly as before.
const USE_CRT_FRAME = shouldUseCrtFrame();

function Site() {
  const [transitionActive, setTransitionActive] = useState(true);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleTransitionComplete = useCallback(() => {
    setTransitionActive(false);
  }, []);

  return (
    <>
      {transitionActive && (
        <CrtOpeningTransition
          contentRef={mainContentRef}
          onComplete={handleTransitionComplete}
        />
      )}

      <CrtScreenEffect />
      <div
        ref={mainContentRef}
        className="crt-power-on-content"
        data-crt-power-on={transitionActive ? 'true' : undefined}
      >
        <MainSite />
      </div>
    </>
  );
}

function App() {
  const [useCrt, setUseCrt] = useState(USE_CRT_FRAME);

  // No WebGPU → no CRT scene; show the normal site instead of an empty frame.
  useEffect(() => {
    if (!USE_CRT_FRAME) return;
    let cancelled = false;
    crtGpuAvailable().then((ok) => {
      if (!ok && !cancelled) setUseCrt(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!useCrt) return <Site />;
  return (
    <CrtErrorBoundary fallback={<Site />}>
      <CrtFrame />
    </CrtErrorBoundary>
  );
}

export default App;
