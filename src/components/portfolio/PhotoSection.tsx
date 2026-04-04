// Photography section using Aceternity Focus Cards
// Instagram: @shauncena17
import { FocusCards } from '../ui/focus-cards';
import type { FocusCard } from '../ui/focus-cards';

// Placeholder gradient cards — swap src in when you have real images
const PHOTO_CARDS: FocusCard[] = [
  {
    title: 'The Wall',
    src: "https://instagram.fmnl44-1.fna.fbcdn.net/v/t51.75761-15/482524090_18362520637131480_7327501121127671174_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&_nc_cat=106&ig_cache_key=MzU4MTUwMzE2MDM2OTI1NjI0Mw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTgwMC5zZHIuQzMifQ%3D%3D&_nc_ohc=3n3k9cdBD4UQ7kNvwG1P-Wi&_nc_oc=AdoTlaWqPyUX0sl8PWqlEwqFVCbrmFGmFP5IgoPCbgtpY1euK_7zrl7Zn5YsVjeAxEiH1yY2oT-ORVVraSuqYY_-&_nc_ad=z-m&_nc_cid=5917&_nc_zt=23&_nc_ht=instagram.fmnl44-1.fna&_nc_gid=IWxK4VwAIwS0Xm9wKxjmaA&_nc_ss=7a32e&oh=00_Af2gvh8h4SE-SjywoxSXUbdUCbIvYmDeIOj7Izd6pLoleg&oe=69D5BBC5",
    accentColor: '#f59e0b',
    location: 'Intramuros, Manila',
    camera: 'Sony Powershot SX430 IS',
    thoughtProcess: 'I was walking around Intramuros and i saw this wall with this window that was so compelling it felt serene and i just had to take a picture.',
  },
  {
    title: 'The City',
    src: "https://i.imgur.com/ZcF1qCu.jpeg",
    accentColor: '#f59e0b',
    location: 'Pasig City',
    camera: 'IPhone 11',
    thoughtProcess: 'The sharp angles of the architecture caught my eye. It felt suffocating but weirdly calming.',
  },
  {
    title: 'The Train',
    src: "https://i.imgur.com/6vnFaGc.jpeg",
    accentColor: '#f59e0b',
    location: 'Dr Santos Station',
    camera: 'iPhone 11',
    thoughtProcess: 'I was going on a walk with my friends and we noticed this scene. I thought it would be a great shot. The soft, diffused light coming from the window was perfect.',
  },
  {
    title: 'The Crosswalk',
    src: "https://i.imgur.com/oVY8kj2.jpeg",
    accentColor: '#f59e0b',
    location: 'Fort Santiago',
    camera: 'Sony Powershot SX430 IS',
    thoughtProcess: 'Street photography is about capturing raw, unfiltered moments. I was walking to Fort Santiago and before i crossed the street a beam of light suddenly hit the sidewalk and an overwhelming feeling of calm washed over me, it was as if everything went silent and all that mattered was that moment. I knew i had to capture this moment.',
  },
  {
    title: 'The Feeling',
    src: "https://i.imgur.com/02Y4tXT.jpeg",
    accentColor: '#f59e0b',
    location: 'Smart Araneta Coliseum',
    camera: 'Sony Powershot SX430 IS',
    thoughtProcess: 'During the Chromokopia Tyler the Creator concert, I felt so moved by the performance that I had to capture the moment. I used the long exposure to capture the movement of the lights and the crowd.',
  },
  {
    title: 'The Obelisk',
    src: "https://i.imgur.com/6LgLFZu.jpeg",
    accentColor: '#f59e0b',
    location: 'Polytechnic University of the Philippines Manila',
    camera: 'Canon EOS M50 Mark II',
    thoughtProcess: 'It was a school event and the we were there early to prepare our booth, and i noticed the way the light was hitting the obelisk and it caught my eye.',
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
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-[#f59e0b]/40 rounded-full px-4 py-2 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f59e0b]">
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
            <span key={tag} className="text-xs px-3 py-1 rounded-full border border-[#f59e0b]/20 text-[#f59e0b]/70 bg-[#f59e0b]/5 font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
