import { useState, useEffect } from 'react';
import { TextFlippingBoard } from './components/ui/text-flipping-board';
import { BackgroundRippleEffect } from './components/ui/background-ripple-effect';

function App() {
  const [boardText, setBoardText] = useState("  A NEW WEBSITE \n\n    COMING SOON  ");

  useEffect(() => {
    // Optionally cycle through messages
    const sequence = [
      " SHOOTING STARS\n       STUDIO   \n ",
      " UNDER CONSTRUCTION \n  COMING BACK \n    SOON ",
    ];
    let i = 0;
    // Wait until the initial flip is finished before starting the loop
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

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 font-sans overflow-hidden">

      {/* Background Ripple Effect Component */}
      <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden">
        <BackgroundRippleEffect />
      </div>

      {/* Dark overlay to ensure the board remains very visible */}
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none"></div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        <TextFlippingBoard
          text={boardText}
          className="dark w-full"
        />
      </div>
    </main>
  );
}

export default App;
