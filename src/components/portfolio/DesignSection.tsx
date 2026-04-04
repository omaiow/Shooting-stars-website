// Graphic Design section using Aceternity Focus Cards
// Instagram: @omai.design
import { FocusCards } from '../ui/focus-cards';
import type { FocusCard } from '../ui/focus-cards';

const DESIGN_CARDS: FocusCard[] = [
  {
    title: 'Formula 1 Inspired',
    src: "https://i.imgur.com/4Q1hHuW.jpeg",
    accentColor: '#3b82f6',
    description: 'A high-octane poster series inspired by F1 racing aesthetics — speed, precision, motion blur.',
    process: 'Started with high-res reference photos and existing 3d models of the cars from the internet. I then used blender to edit the models to customize the cars to fit the branding of my academic organization (PUP ASCII) and to get the angles and lighting i wanted for the shot. I then took it into photoshop to composite the image along with the text and other elements.',
    software: [
      { name: 'Photoshop', role: 'Compositing, motion FX & typography' },
      { name: 'Blender', role: '3D modeling and rendering' },

    ],
  },
  {
    title: 'Better Together',
    src: "https://i.imgur.com/EylErww.jpeg",
    accentColor: '#3b82f6',
    description: 'A warmth-forward design piece exploring connection and togetherness through different generations of block games.',
    process: 'I wanted to create a piece that explored the idea of connection and togetherness through the lens of block games. I started by using blockbench to get the models of the characters from Minecraft and Hytale and then rendering it in blender. I then used photoshop to composite the image along with sprites of the farmer from Stardew Valley and the Guide from Terraria. I felt so much that the communities of these games were fractured for no reason, i feel like it should be celebrated that we have these amazing games that allow you to express yourself in different ways.',
    software: [
      { name: 'Photoshop', role: 'Layer compositing, blending & colour' },
      { name: 'Blender', role: '3D rendering' },
      { name: 'Blockbench', role: '3D modeling' },
      { name: 'Lightroom', role: 'Tone & warmth grading' },
    ],
  },
  {
    title: 'Resident Evil Inspired',
    src: "https://i.imgur.com/MphiG3h.jpeg",
    accentColor: '#3b82f6',
    description: 'A funny, survival-horror themed poster inspired by the Resident Evil franchise visual language.',
    process: 'I was watching let\'s plays of Resident Evil Requiem and was really inspired by the game\'s atmosphere and visual language. I wanted to create a poster that looked like you picked up an item in the game and made it kinda a goofy item inkeeping with the humor of Resident Evil.',
    software: [
      { name: 'Photoshop', role: 'Texture layering, masking & distress FX' },
    ],
  },
  {
    title: 'Kanibalismo',
    src: "https://i.imgur.com/sqi2r7K.jpeg",
    accentColor: '#3b82f6',
    description: 'A Receipt inspired poster based off the song Pag-ibig ay Kanibalismo II by Fitterkarma',
    process: 'I made this poster as a part of a 30 day design challenge. I wanted to capture the essence of the song in a visual format. For me how the song represented the toxicity of love using cannibalism was really effective so i choose to lean into that with the butcher shop receipt.',
    software: [
      { name: 'Photoshop', role: 'Layout, type distortion & image treatment' },
      { name: 'Figma', role: 'Layout & vector graphics' },
    ],
  },
  {
    title: 'Retro Design',
    src: "https://i.imgur.com/yxSY9Mk.jpeg",
    accentColor: '#3b82f6',
    description: 'A throwback aesthetic piece pulling from 70s–80s print design — grain, muted palettes, and vintage type.',
    process: 'Added film grain and halftone overlays on top of the base composition, then pushed the warmth and reduced contrast to mimic aged print. Typography was sourced from display fonts common in that era.',
    software: [
      { name: 'Photoshop', role: 'Grain, halftone FX & vintage colour treatment' },
    ],
  },
  {
    title: 'Pop Design',
    src: "https://i.imgur.com/X05z60Q.jpeg",
    accentColor: '#3b82f6',
    description: 'A bold, maximalist pop art piece — flat colours, loud type, high contrast.',
    process: 'Inspired by pop art and contemporary pop illustration. Started with a clean vector base in Figma for the layout, then moved to Photoshop to add halftone dots and light effects. The goal was to feel unapologetically loud.',
    software: [
      { name: 'Figma', role: 'Layout & vector structure' },
      { name: 'Photoshop', role: 'Halftone FX, colour fills & final composition' },
    ],
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

        <FocusCards cards={DESIGN_CARDS} />

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
