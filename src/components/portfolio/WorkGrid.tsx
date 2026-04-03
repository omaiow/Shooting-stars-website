import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

// Adapted from Aceternity Card Hover Effect — using their sliding highlight pattern
// but customised for our 3-card work grid with modal support

interface WorkCard {
  id: string;
  category: string;
  title: string;
  description: string;
  glowColor: string;
  gradient: string;
  tags: string[];
  modalContent: React.ReactNode;
}

function VideoPlaceholder() {
  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center rounded-xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #051209 0%, #0a1f12 100%)' }}>
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #00a35c22 0px, #00a35c22 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #00a35c22 0px, #00a35c22 1px, transparent 1px, transparent 40px)' }} />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full border-2 border-[#00a35c] flex items-center justify-center bg-[#00a35c]/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#00a35c">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <p className="text-[#00a35c] text-xs tracking-widest font-mono">VIDEO WORK</p>
        <p className="text-neutral-500 text-xs">@oma1036 · @Wolfboys</p>
      </div>
    </div>
  );
}

function ImagePlaceholder({ label, color }: { label: string; color: string }) {
  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center rounded-xl overflow-hidden border"
      style={{ background: '#0a0a0a', borderColor: color + '33' }}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `repeating-linear-gradient(45deg, ${color}22 0px, ${color}22 1px, transparent 1px, transparent 30px)` }} />
      <p className="text-xs tracking-widest font-mono" style={{ color }}>{label.toUpperCase()}</p>
      <p className="text-neutral-600 text-xs mt-2">Images drop in here</p>
    </div>
  );
}

const CARDS: WorkCard[] = [
  {
    id: 'video',
    category: 'Video Work',
    title: 'Gaming & Creative Short-form',
    description: 'High-energy short-form edits for @oma1036 and @Wolfboys. CapCut for quick cuts, DaVinci Resolve for color grading and compositing.',
    glowColor: '#00a35c',
    gradient: 'linear-gradient(135deg, #051209 0%, #0a1f12 100%)',
    tags: ['CapCut', 'DaVinci Resolve', 'Short-form', '@oma1036'],
    modalContent: <VideoPlaceholder />,
  },
  {
    id: 'design',
    category: 'Graphic Design',
    title: 'Visual Design & Publications',
    description: 'Logo design, publication materials, and event graphics. Led the high school publication team; now heading creative committees in college.',
    glowColor: '#a855f7',
    gradient: 'linear-gradient(135deg, #0d0714 0%, #1a1028 100%)',
    tags: ['Photoshop', 'Figma', 'Publications', 'Logos'],
    modalContent: <ImagePlaceholder label="Graphic Design" color="#a855f7" />,
  },
  {
    id: 'photo',
    category: 'Photography',
    title: 'Personal & Creative Photography',
    description: 'Photography as a creative pursuit — capturing light and moments with a distinct eye. Post-processing in Lightroom.',
    glowColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, #120d00 0%, #1f1600 100%)',
    tags: ['Lightroom', 'Photography', 'Personal'],
    modalContent: <ImagePlaceholder label="Photography" color="#f59e0b" />,
  },
];

function WorkModal({ card, onClose }: { card: WorkCard; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 bg-neutral-950"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 0 60px ${card.glowColor}22` }}
      >
        {/* Glow top border */}
        <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${card.glowColor}, transparent)` }} />

        <button
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="p-6 pt-5">
          {card.modalContent}

          <div className="mt-5">
            <span className="text-xs tracking-widest uppercase font-medium" style={{ color: card.glowColor }}>
              — {card.category}
            </span>
            <h3 className="text-white font-bold text-xl mt-1">{card.title}</h3>
            <p className="text-neutral-400 text-sm mt-3 leading-relaxed">{card.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {card.tags.map(tag => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full border font-mono"
                  style={{ borderColor: card.glowColor + '44', color: card.glowColor, background: card.glowColor + '11' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function WorkGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<WorkCard | null>(null);

  return (
    <section className="py-24 px-4 md:px-8 bg-[#030712]" id="work">
      {/* Section header */}
      <div className="max-w-6xl mx-auto mb-12">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2 font-medium">Selected Work</p>
        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Work</h2>
      </div>

      {/* Aceternity-style card hover grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map((card, idx) => (
          <div
            key={card.id}
            className="relative group block p-1 h-full w-full cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setActiveCard(card)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveCard(card)}
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

            <div
              className={cn(
                'rounded-2xl h-full w-full overflow-hidden relative z-20 border transition-all duration-300',
                hoveredIndex === idx ? 'border-white/20' : 'border-white/[0.05]'
              )}
              style={{ background: card.gradient }}
            >
              {/* Orb glow at top right */}
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                style={{ background: card.glowColor }}
              />

              <div className="relative z-10 p-6">
                {/* Top: category + arrow */}
                <div className="flex items-start justify-between mb-6">
                  <span className="text-xs tracking-widest uppercase font-medium" style={{ color: card.glowColor }}>
                    {card.category}
                  </span>
                  <div className={cn('transition-transform duration-300', hoveredIndex === idx ? 'translate-x-1 -translate-y-1' : '')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-600">
                      <path d="M7 17L17 7M17 7H7M17 7v10"/>
                    </svg>
                  </div>
                </div>

                {/* Visual */}
                <div className="mb-6">{card.modalContent}</div>

                {/* Title + desc */}
                <h3 className="text-white font-bold text-lg tracking-tight mb-2">{card.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2">{card.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {card.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeCard && <WorkModal card={activeCard} onClose={() => setActiveCard(null)} />}
      </AnimatePresence>
    </section>
  );
}
