// Aceternity-inspired Spotlight component
// Based on: https://ui.aceternity.com/components/spotlight

import { useRef, useState, useCallback } from 'react';

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className = '', fill = 'white' }: SpotlightProps) {
  return (
    <svg
      className={`aceternity-spotlight ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter id="filter" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  );
}

// Aceternity-inspired card spotlight (mouse-track glow inside card)
interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function CardSpotlight({ children, className = '', glowColor = 'rgba(255,255,255,0.05)' }: CardSpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={divRef}
      className={`card-spotlight ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <div
        className="card-spotlight__glow"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

// Aceternity-inspired TextGenerateEffect
interface TextGenerateProps {
  words: string;
  className?: string;
  delay?: number;
}

export function TextGenerateEffect({ words, className = '', delay = 0 }: TextGenerateProps) {
  const wordList = words.split(' ');
  return (
    <span className={`text-generate ${className}`}>
      {wordList.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="text-generate__word"
          style={{ animationDelay: `${delay + i * 80}ms` }}
        >
          {word}{' '}
        </span>
      ))}
    </span>
  );
}

// Aceternity-inspired Moving Border button wrapper
interface MovingBorderProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}

export function MovingBorder({ children, className = '', borderColor = '#00a35c' }: MovingBorderProps) {
  return (
    <div className={`moving-border-wrapper ${className}`}>
      <div
        className="moving-border-line"
        style={{ '--border-color': borderColor } as React.CSSProperties}
      />
      <div className="moving-border-inner">{children}</div>
    </div>
  );
}
