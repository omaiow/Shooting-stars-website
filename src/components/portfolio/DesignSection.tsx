// Graphic Design section using Aceternity Focus Cards
// Instagram: @omai.design
import { FocusCards } from '../ui/focus-cards';
import { DESIGN_WORK, showcase } from '@/data/portfolio';

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
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-[#3b82f6]/40 rounded-full px-4 py-2 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3b82f6]">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            @omai.design
          </a>
        </div>

        <FocusCards cards={showcase(DESIGN_WORK)} />

        <div className="mt-8 flex flex-wrap gap-2">
          {['Photoshop', 'Figma', 'Publications', 'Logos', 'Brand Identity'].map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full border border-[#3b82f6]/20 text-[#3b82f6]/70 bg-[#3b82f6]/5 font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
