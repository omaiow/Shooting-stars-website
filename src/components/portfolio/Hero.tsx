import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'motion/react';
import { Spotlight } from '../ui/spotlight';
import { TextGenerateEffect } from '../ui/text-generate-effect';
import { BackgroundRippleEffect } from '../ui/background-ripple-effect';

// Floating star particles
const STARS = [
  { size: 12, x: '8%',  y: '20%', delay: 0,    duration: 6  },
  { size: 8,  x: '88%', y: '15%', delay: 1,    duration: 8  },
  { size: 16, x: '75%', y: '70%', delay: 0.5,  duration: 7  },
  { size: 10, x: '15%', y: '75%', delay: 1.5,  duration: 9  },
  { size: 7,  x: '92%', y: '50%', delay: 2,    duration: 5  },
  { size: 14, x: '5%',  y: '50%', delay: 0.8,  duration: 10 },
  { size: 9,  x: '50%', y: '88%', delay: 1.2,  duration: 7  },
  { size: 6,  x: '60%', y: '10%', delay: 0.3,  duration: 8  },
];

function FloatingStar({ size, x, y, delay, duration }: typeof STARS[0]) {
  return (
    <motion.span
      className="absolute pointer-events-none select-none text-[#00a35c]"
      style={{ left: x, top: y, fontSize: size, opacity: 0.25 }}
      animate={{
        y: [0, -14, 0],
        opacity: [0.15, 0.4, 0.15],
        rotate: [0, 20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      ✦
    </motion.span>
  );
}

const SUBTITLE = "Graphic Designer · Video Editor · Creative Lead";

export function Hero() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const headingX = useTransform(springX, [-1, 1], [-12, 12]);
  const headingY = useTransform(springY, [-1, 1], [-8, 8]);
  const bgX = useTransform(springX, [-1, 1], [8, -8]);
  const bgY = useTransform(springY, [-1, 1], [6, -6]);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    const t = setTimeout(() => setReady(true), 200);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#030712]"
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Aceternity Spotlights */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#00a35c" />
      <Spotlight className="top-10 right-0 h-[80vh] w-[50vw]" fill="white" />

      {/* Parallax ripple background */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ x: bgX, y: bgY, scale: 1.05 }}
      >
        {dimensions.width > 0 && (
          <BackgroundRippleEffect
            rows={Math.ceil(dimensions.height / 56) + 1}
            cols={Math.ceil(dimensions.width / 56) + 1}
          />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

      {/* Floating star particles */}
      {STARS.map((star, i) => (
        <FloatingStar key={i} {...star} />
      ))}

      {/* Animated green glow orb — drifts slowly */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(0,163,92,0.08) 0%, transparent 70%)',
          left: '50%',
          top: '50%',
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content with parallax */}
      <motion.div
        className="relative z-10 text-center max-w-5xl px-4"
        style={{ x: headingX, y: headingY }}
      >
        {/* Eyebrow — slides down */}
        <motion.p
          className="text-[#00a35c] text-sm tracking-[0.3em] uppercase mb-6 font-medium"
          initial={{ opacity: 0, y: -20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Shooting Stars Studio
        </motion.p>

        {/* Heading — Aceternity text generate */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tight text-white mb-6 leading-none">
          {ready && (
            <TextGenerateEffect
              words="hi, i'm shon."
              className="!text-7xl md:!text-9xl !font-black !tracking-tight !text-white !leading-none !mt-0"
              duration={0.4}
            />
          )}
        </h1>

        {/* Subtitle — fades in after heading */}
        <motion.p
          className="text-neutral-400 text-lg md:text-xl tracking-wide"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          {SUBTITLE}
        </motion.p>

        {/* CTA row */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <a
            href="#work"
            onClick={(e) => { e.preventDefault(); document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="px-6 py-3 rounded-full bg-[#00a35c] text-black font-bold text-sm hover:bg-[#00c46e] transition-colors"
          >
            View My Work
          </a>
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="px-6 py-3 rounded-full border border-white/10 text-white text-sm hover:border-white/30 transition-colors"
          >
            Get in Touch
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom — label + scroll */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-8 z-10"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 2.2 }}
      >
        <span className="text-neutral-600 text-xs tracking-widest uppercase">2026</span>
        <div className="flex flex-col items-center gap-2">
          <span className="text-neutral-600 text-xs tracking-widest">Scroll</span>
          <motion.div
            className="w-px h-12 bg-[#00a35c]/40"
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
