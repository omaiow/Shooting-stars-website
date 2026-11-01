import { useState, useCallback, useRef, useEffect } from 'react';
import { MainSite } from './components/portfolio/MainSite';
import { CrtOpeningTransition } from './components/ui/crt-opening-transition';
import { CrtScreenEffect } from './components/ui/crt-screen-effect';
import { CrtFrame } from './components/crt/CrtFrame';
import { CRT_SCENE_URL, crtGpuAvailable, crtMode, type CrtMode } from './components/crt/crt-config';
import { crtSound } from './components/crt/crt-sound';
import { CrtErrorBoundary } from './components/crt/CrtErrorBoundary';
import { TerminalSite } from './components/terminal/TerminalSite';

// Decided once per page load:
//   /?tty    → the terminal UI (what the 3D CRT shows on its screen)
//   /?screen → the original site, full screen
//   /        → big desktop screens get the 3D CRT; phones/tablets get the 3D
//              opening, which dives into the screen and hands over to the terminal
const ROUTE_TTY =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('tty');
const MODE: CrtMode = ROUTE_TTY ? 'site' : crtMode();

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

/** Phones, after the dive: the terminal fills the screen and powers on. */
function PhoneTerminal() {
  useEffect(() => {
    crtSound.powerOn();
    crtSound.startHum();
    return () => crtSound.stopHum(0.1);
  }, []);
  return (
    <div className="crt-phone">
      <div className="crt-tube crt-phone-on">
        <TerminalSite />
      </div>
      {/* Outside the animated layer: inside it the scanline overlay renders black */}
      <CrtScreenEffect />
    </div>
  );
}

type View = CrtMode | 'terminal';

function CrtApp() {
  const [view, setView] = useState<View>(MODE === 'dive' && !CRT_SCENE_URL ? 'terminal' : MODE);
  const toTerminal = useCallback(() => setView('terminal'), []);

  // No WebGPU → no 3D scene: desktops get the normal site, phones the terminal.
  useEffect(() => {
    if (MODE === 'site') return;
    let cancelled = false;
    crtGpuAvailable().then((ok) => {
      if (!ok && !cancelled) setView((v) => (v === 'dive' ? 'terminal' : v === 'frame' ? 'site' : v));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (view === 'site') return <Site />;
  if (view === 'terminal') return <PhoneTerminal />;
  if (view === 'dive') {
    return (
      <CrtErrorBoundary fallback={<PhoneTerminal />}>
        <CrtFrame onDiveEnd={toTerminal} />
      </CrtErrorBoundary>
    );
  }
  return (
    <CrtErrorBoundary fallback={<Site />}>
      <CrtFrame />
    </CrtErrorBoundary>
  );
}

export default App;
