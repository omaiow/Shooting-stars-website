import { useState, useEffect, useCallback } from 'react';
import { TextFlippingBoard } from './components/ui/text-flipping-board';
import { BackgroundRippleEffect } from './components/ui/background-ripple-effect';
import { CurtainTransition } from './components/ui/curtain-transition';
import { MainSite } from './components/portfolio/MainSite';
import { HoverBorderGradient } from './components/ui/hover-border-gradient';

type Page = 'landing' | 'main';

function App() {
  const [boardText, setBoardText] = useState("  WELCOME TO MY \n\n    PORTFOLIO  ");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [page, setPage] = useState<Page>('landing');

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const sequence = [
      " SHOOTING STARS \n \n       STUDIO   \n ",
      " HELLO \n I'M SHAUN \n WELCOME TO MY PORTFOLIO ",
    ];
    let i = 0;
    const timeout = setTimeout(() => {
      setBoardText(sequence[0]);
      i++;
      const interval = setInterval(() => {
        setBoardText(sequence[i % sequence.length]);
        i++;
      }, 7000);
      return () => clearInterval(interval);
    }, 4000);
    return () => clearTimeout(timeout);
  }, []);

  const handleEnterSite = useCallback(() => {
    // Start curtain transition
    setCurtainOpen(true);
  }, []);

  const handleMidpoint = useCallback(() => {
    // Switch to main site when curtains are fully closed horizontally
    setPage('main');
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setCurtainOpen(false);
  }, []);

  return (
    <>
      {/* Curtain overlay — only mounted once button is clicked */}
      {curtainOpen && (
        <CurtainTransition onMidpoint={handleMidpoint} onComplete={handleTransitionComplete} />
      )}

      {page === 'landing' && (
        <main className="landing-screen min-h-screen relative flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
          {/* Background Ripple Effect */}
          <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden">
            {dimensions.width > 0 && (
              <BackgroundRippleEffect
                rows={Math.ceil(dimensions.height / 56) + 1}
                cols={Math.ceil(dimensions.width / 56) + 1}
              />
            )}
          </div>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none"></div>

          <div className="z-10 w-full max-w-5xl flex flex-col items-center">
            <TextFlippingBoard
              text={boardText}
              className="dark w-full"
            />

            <div className="mt-12">
              <HoverBorderGradient
                containerClassName="cursor-pointer"
                className="flex items-center gap-2 px-6 py-2 bg-[#030712] font-semibold tracking-wide text-sm"
                onClick={handleEnterSite}
              >
                <svg
                  height="20"
                  width="20"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M0 0h24v24H0z" fill="none"></path>
                  <path
                    d="M5 13c0-5.088 2.903-9.436 7-11.182C16.097 3.564 19 7.912 19 13c0 .823-.076 1.626-.22 2.403l1.94 1.832a.5.5 0 0 1 .095.603l-2.495 4.575a.5.5 0 0 1-.793.114l-2.234-2.234a1 1 0 0 0-.707-.293H9.414a1 1 0 0 0-.707.293l-2.234 2.234a.5.5 0 0 1-.793-.114l-2.495-4.575a.5.5 0 0 1 .095-.603l1.94-1.832C5.077 14.626 5 13.823 5 13zm1.476 6.696l.817-.817A3 3 0 0 1 9.414 18h5.172a3 3 0 0 1 2.121.879l.817.817.982-1.8-1.1-1.04a2 2 0 0 1-.593-1.82c.124-.664.187-1.345.187-2.036 0-3.87-1.995-7.3-5-8.96C8.995 5.7 7 9.13 7 13c0 .691.063 1.372.187 2.037a2 2 0 0 1-.593 1.82l-1.1 1.039.982 1.8zM12 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span>Enter Site</span>
              </HoverBorderGradient>
            </div>
          </div>
        </main>
      )}

      {page === 'main' && <MainSite />}
    </>
  );
}

export default App;
