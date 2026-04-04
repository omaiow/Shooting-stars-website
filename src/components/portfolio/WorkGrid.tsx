import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  Expandable,
  ExpandableContent,
  ExpandableTrigger,
} from '@/components/ui/expandable';

interface WorkCard {
  id: string;
  category: string;
  title: string;
  teaser: string;
  glowColor: string;
  gradient: string;
  tags: string[];
  process: string;
  software: { name: string; role: string }[];
  visual: React.ReactNode;
}

function VideoVisual() {
  return (
    <div
      className="relative w-full h-36 flex flex-col items-center justify-center rounded-xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #051209 0%, #0a1f12 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #00a35c22 0px, #00a35c22 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #00a35c22 0px, #00a35c22 1px, transparent 1px, transparent 40px)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-2 border-[#00a35c] flex items-center justify-center bg-[#00a35c]/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#00a35c">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <p className="text-[#00a35c] text-xs tracking-widest font-mono">VIDEO WORK</p>
        <p className="text-neutral-500 text-xs">@oma1036 · @Wolfboys</p>
      </div>
    </div>
  );
}

function DesignVisual() {
  return (
    <div
      className="relative w-full h-36 flex flex-col items-center justify-center rounded-xl overflow-hidden border"
      style={{ background: '#0a0a0a', borderColor: '#a855f733' }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #a855f722 0px, #a855f722 1px, transparent 1px, transparent 30px)' }}
      />
      <p className="text-xs tracking-widest font-mono text-[#a855f7]">GRAPHIC DESIGN</p>
      <p className="text-neutral-600 text-xs mt-2">Logos · Publications · Events</p>
    </div>
  );
}

function PhotoVisual() {
  return (
    <div
      className="relative w-full h-36 flex flex-col items-center justify-center rounded-xl overflow-hidden border"
      style={{ background: '#0a0a0a', borderColor: '#f59e0b33' }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b22 0px, #f59e0b22 1px, transparent 1px, transparent 30px)' }}
      />
      <p className="text-xs tracking-widest font-mono text-[#f59e0b]">PHOTOGRAPHY</p>
      <p className="text-neutral-600 text-xs mt-2">Light · Moments · Story</p>
    </div>
  );
}

const CARDS: WorkCard[] = [
  {
    id: 'video',
    category: 'Video Work',
    title: 'Gaming & Creative Short-form',
    teaser: 'High-energy short-form edits for @oma1036 and @Wolfboys.',
    glowColor: '#00a35c',
    gradient: 'linear-gradient(135deg, #051209 0%, #0a1f12 100%)',
    tags: ['CapCut', 'DaVinci Resolve', 'Short-form', '@oma1036'],
    process:
      'I start every edit with the audio — finding the beat drops and emotional peaks first, then building the cut around them. Quick rough cuts in CapCut to nail the pacing, then bring it into DaVinci Resolve for colour grading, VFX layers, and the final polish. Most edits take 2–6 hours depending on complexity.',
    software: [
      { name: 'CapCut', role: 'Rough cuts, timing & pacing' },
      { name: 'DaVinci Resolve', role: 'Colour grading, compositing & export' },
    ],
    visual: <VideoVisual />,
  },
  {
    id: 'design',
    category: 'Graphic Design',
    title: 'Visual Design & Publications',
    teaser: 'Logo design, publication materials, and event graphics.',
    glowColor: '#a855f7',
    gradient: 'linear-gradient(135deg, #0d0714 0%, #1a1028 100%)',
    tags: ['Photoshop', 'Figma', 'Publications', 'Logos'],
    process:
      'Design always starts with research and moodboarding — I gather references, define the visual language, and sketch ideas before touching the software. Figma is my go-to for anything structural (layouts, UI, systems), while Photoshop handles the heavy lifting for photo manipulation, textures, and print-ready artwork.',
    software: [
      { name: 'Figma', role: 'Layout, UI systems & prototyping' },
      { name: 'Photoshop', role: 'Photo manipulation, print design & textures' },
    ],
    visual: <DesignVisual />,
  },
  {
    id: 'photo',
    category: 'Photography',
    title: 'Personal & Creative Photography',
    teaser: 'Photography as a creative pursuit — capturing light and moments.',
    glowColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, #120d00 0%, #1f1600 100%)',
    tags: ['Lightroom', 'Photography', 'Personal'],
    process:
      'I shoot with purpose — composition and light are everything. I usually scout locations beforehand and wait for the right light rather than fixing it in post. Lightroom handles the edit: a consistent tone curve, colour grading tuned to the mood of the shot, and subtle local adjustments. No heavy retouching — just bringing out what was already there.',
    software: [
      { name: 'Lightroom', role: 'Colour grading, toning & local adjustments' },
    ],
    visual: <PhotoVisual />,
  },
];

function WorkCard({ card, isHovered }: { card: WorkCard; isHovered: boolean }) {
  return (
    <Expandable transitionDuration={0.4} easeType="easeInOut">
      {({ isExpanded }) => (
        <ExpandableTrigger>
          <div
            className={cn(
              'rounded-2xl overflow-hidden border transition-all duration-300 h-full',
              isHovered && !isExpanded ? 'border-white/20' : 'border-white/[0.05]',
              isExpanded ? 'border-white/20' : ''
            )}
            style={{ background: card.gradient }}
          >
            {/* Orb glow */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40 pointer-events-none"
              style={{ background: card.glowColor }}
            />

            <div className="relative z-10 p-6">
              {/* Top: category + expand indicator */}
              <div className="flex items-start justify-between mb-5">
                <span
                  className="text-xs tracking-widest uppercase font-medium"
                  style={{ color: card.glowColor }}
                >
                  {card.category}
                </span>
                <motion.div
                  animate={{ rotate: isExpanded ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-neutral-600"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </motion.div>
              </div>

              {/* Visual thumbnail */}
              <div className="mb-5">{card.visual}</div>

              {/* Title + teaser */}
              <h3 className="text-white font-bold text-lg tracking-tight mb-2">{card.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{card.teaser}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {card.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Expandable: process + software */}
              <ExpandableContent preset="slide-up">
                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-xs tracking-widest uppercase font-medium text-neutral-500 mb-2">
                    How I make it
                  </p>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-5">
                    {card.process}
                  </p>

                  <p className="text-xs tracking-widest uppercase font-medium text-neutral-500 mb-3">
                    Software used
                  </p>
                  <div className="flex flex-col gap-2">
                    {card.software.map(s => (
                      <div
                        key={s.name}
                        className="flex items-center justify-between rounded-xl px-4 py-3 border border-white/5 bg-white/[0.03]"
                      >
                        <span
                          className="text-sm font-semibold"
                          style={{ color: card.glowColor }}
                        >
                          {s.name}
                        </span>
                        <span className="text-neutral-500 text-xs">{s.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ExpandableContent>
            </div>
          </div>
        </ExpandableTrigger>
      )}
    </Expandable>
  );
}

export function WorkGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 md:px-8 bg-[#030712]" id="work">
      {/* Section header */}
      <div className="max-w-6xl mx-auto mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2 font-medium">Selected Work</p>
        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Work</h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {CARDS.map((card, idx) => (
          <div
            key={card.id}
            className="relative group block p-1 w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full block rounded-3xl"
                  style={{ background: card.glowColor + '18' }}
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                />
              )}
            </AnimatePresence>

            <WorkCard card={card} isHovered={hoveredIndex === idx} />
          </div>
        ))}
      </div>
    </section>
  );
}
