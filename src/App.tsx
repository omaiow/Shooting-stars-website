import { useState, useCallback, useRef, useEffect } from 'react';
import { MainSite } from './components/portfolio/MainSite';
import { CrtOpeningTransition } from './components/ui/crt-opening-transition';
import { CrtScreenEffect } from './components/ui/crt-screen-effect';
import { CrtFrame } from './components/crt/CrtFrame';
import { crtGpuAvailable, shouldUseCrtFrame } from './components/crt/crt-config';
import { CrtErrorBoundary } from './components/crt/CrtErrorBoundary';
import { TerminalSite } from './components/terminal/TerminalSite';

// Decided once per page load:
//   /?tty    → the terminal UI (what the 3D CRT shows on its screen)
//   /?screen → the original site, full screen
//   /        → big desktop screens get the 3D CRT; phones/tablets get the original site
const ROUTE_TTY =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('tty');
const USE_CRT_FRAME = !ROUTE_TTY && shouldUseCrtFrame();

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
  if (ROUTE_TTY) {
    return (
      <>
        <CrtScreenEffect />
        <TerminalSite />
      </>
    );
  }
  return <CrtApp />;
}

function CrtApp() {
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
