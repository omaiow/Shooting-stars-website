// Photography section using Aceternity Focus Cards
// Instagram: @shauncena17
import { FocusCards } from '../ui/focus-cards';
import type { FocusCard } from '../ui/focus-cards';

// Photography cards displayed in the portfolio's focus-card gallery.
const PHOTO_CARDS: FocusCard[] = [
  {
    title: 'The Wall',
    src: 'https://i.imgur.com/N7dSjW0.jpeg',
    accentColor: '#2563eb',
    location: 'Intramuros, Manila',
    camera: 'Sony Powershot SX430 IS',
    thoughtProcess: 'I was walking around Intramuros and i saw this wall with this window that was so compelling it felt serene and i just had to take a picture.',
  },
  {
    title: 'The City',
    src: "https://i.imgur.com/ZcF1qCu.jpeg",
    accentColor: '#2563eb',
    location: 'Pasig City',
    camera: 'IPhone 11',
    thoughtProcess: 'The sharp angles of the architecture caught my eye. It felt suffocating but weirdly calming.',
  },
  {
    title: 'The Train',
    src: "https://i.imgur.com/6vnFaGc.jpeg",
    accentColor: '#2563eb',
    location: 'Dr Santos Station',
    camera: 'iPhone 11',
    thoughtProcess: 'I was going on a walk with my friends and we noticed this scene. I thought it would be a great shot. The soft, diffused light coming from the window was perfect.',
  },
  {
    title: 'The Crosswalk',
    src: "https://i.imgur.com/oVY8kj2.jpeg",
    accentColor: '#2563eb',
    location: 'Fort Santiago',
    camera: 'Sony Powershot SX430 IS',
    thoughtProcess: 'Street photography is about capturing raw, unfiltered moments. I was walking to Fort Santiago and before i crossed the street a beam of light suddenly hit the sidewalk and an overwhelming feeling of calm washed over me, it was as if everything went silent and all that mattered was that moment. I knew i had to capture this moment.',
  },
  {
    title: 'The Feeling',
    src: "https://i.imgur.com/02Y4tXT.jpeg",
    accentColor: '#2563eb',
    location: 'Smart Araneta Coliseum',
    camera: 'Sony Powershot SX430 IS',
    thoughtProcess: 'During the Chromokopia Tyler the Creator concert, I felt so moved by the performance that I had to capture the moment. I used the long exposure to capture the movement of the lights and the crowd.',
  },
  {
    title: 'The Obelisk',
    src: "https://i.imgur.com/6LgLFZu.jpeg",
    accentColor: '#2563eb',
    location: 'Polytechnic University of the Philippines Manila',
    camera: 'Canon EOS M50 Mark II',
    thoughtProcess: 'It was a school ecavent and the we were there early to prepare our booth, and i noticed the way the light was hitting the obelisk and it caught my eye.',
  },
];

export function PhotoSection() {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#030712]" id="photo">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-2 font-medium">Photography</p>
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Photo</h2>
          <a
            href="https://instagram.com/shauncena17"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-[#2563eb]/40 rounded-full px-4 py-2 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2563eb]">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            @shauncena17
          </a>
        </div>

        <FocusCards cards={PHOTO_CARDS} />

        <div className="mt-8 flex flex-wrap gap-2">
          {['Lightroom', 'Photography', 'Color Grading', 'Personal Work'].map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full border border-[#2563eb]/20 text-[#2563eb]/70 bg-[#2563eb]/5 font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
