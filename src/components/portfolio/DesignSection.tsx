// Graphic Design section using Aceternity Focus Cards
// Instagram: @omai.design
import { FocusCards } from '../ui/focus-cards';
import type { FocusCard } from '../ui/focus-cards';

// Placeholder gradient cards — swap src in when you have real images
const DESIGN_CARDS: FocusCard[] = [
  {
    title: 'Formula 1 Inspired',
    src: "https://i.imgur.com/4Q1hHuW.jpeg",
  },
  {
    title: 'Better Together',
    src: "https://i.imgur.com/EylErww.jpeg",
  },
  {
    title: 'Resident Evil Inspired',
    src: "https://i.imgur.com/MphiG3h.jpeg",
  },
  {
    title: 'Kanibalismo',
    src: "https://i.imgur.com/sqi2r7K.jpeg",
  },
  {
    title: 'Retro Design',
    src: "https://i.imgur.com/yxSY9Mk.jpeg",
  },
  {
    title: 'Pop Design',
    src: "https://i.imgur.com/X05z60Q.jpeg",
  },
];

export function DesignSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-black" id="design">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2 font-medium">Graphic Design</p>
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Design</h2>
          <a
            href="https://instagram.com/omai.design"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-[#a855f7]/40 rounded-full px-4 py-2 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a855f7]">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            @omai.design
          </a>
        </div>

        <FocusCards cards={DESIGN_CARDS} />

        <div className="mt-8 flex flex-wrap gap-2">
          {['Photoshop', 'Figma', 'Publications', 'Logos', 'Brand Identity'].map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full border border-[#a855f7]/20 text-[#a855f7]/70 bg-[#a855f7]/5 font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
