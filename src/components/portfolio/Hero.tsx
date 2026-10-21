import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'motion/react';
import Spline from '@splinetool/react-spline';
import { scrollToSection } from '@/lib/scroll';

const SUBTITLE = "Graphic Designer · UI/UX Designer · Video Editor · Creative Lead";

export function Hero() {
  const [ready, setReady] = useState(false);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const headingX = useTransform(springX, [-1, 1], [-12, 12]);
  const headingY = useTransform(springY, [-1, 1], [-8, 8]);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(nx);
    mouseY.set(ny);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#030712]"
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 z-0">
        <Spline
          className="h-full w-full"
          scene="/assets/hero.splinecode"
        />
      </div>

      {/* Main content with parallax */}
      <motion.div
        className="relative z-10 top-36 text-center max-w-5xl px-4"
        style={{ x: headingX, y: headingY }}
      >
        {/* Subtitle — fades in after heading */}
        <motion.p
          className="text-white text-lg md:text-xl tracking-wide"
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
            onClick={(e) => { e.preventDefault(); scrollToSection('#work'); }}
            className="px-6 py-3 rounded-full bg-[#2563eb] text-white font-bold text-sm hover:bg-[#3b82f6] transition-colors"
          >
            View My Work
          </a>
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}
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
            className="w-px h-12 bg-[#2563eb]/40"
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
