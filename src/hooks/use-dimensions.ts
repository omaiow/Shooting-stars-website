import { useState, useEffect } from 'react';

/**
 * Returns current window dimensions, debounced to avoid excessive re-renders
 * during resize. Used by App (landing) and Hero (ripple background).
 */
export function useDimensions(debounceMs = 150) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set initial dimensions immediately
    setDimensions({ width: window.innerWidth, height: window.innerHeight });

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [debounceMs]);

  return dimensions;
}
