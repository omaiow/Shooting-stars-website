import { useState, useCallback, useRef } from 'react';
import { MainSite } from './components/portfolio/MainSite';
import { CrtOpeningTransition } from './components/ui/crt-opening-transition';
import { CrtScreenEffect } from './components/ui/crt-screen-effect';

function App() {
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

export default App;
