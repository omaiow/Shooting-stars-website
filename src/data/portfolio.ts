/**
 * Portfolio content shared by the original site and the CRT terminal UI.
 * Edit work here once and both versions update.
 */
import type { FocusCard } from '@/components/ui/focus-cards';

export const DESIGN_WORK: FocusCard[] = [
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

export const PHOTO_WORK: FocusCard[] = [
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

export const VIDEOS = [
  { id: 'jr6pgriP5W8', title: 'Zenitsu AMV | Yeah Glo!' },
  { id: '5MIPImPRnGM', title: 'Hiraeth - a change of heart' },
  { id: '7LpBqhtV3y8', title: 'Warriors - Jujutsu Kaisen [AMV]' },
];

export const TOOLS = [
  { name: 'Photoshop', years: 9, color: '#31A8FF' }, // Adobe blue
  { name: 'DaVinci Resolve', years: 6, color: '#ED3B49' }, // Resolve aperture red
  { name: 'CapCut', years: 4, color: '#FFFFFF' }, // CapCut white
  { name: 'Lightroom', years: 3, color: '#7DB0E8' }, // Lightroom classic blue
  { name: 'Figma', years: 2, color: '#F24E1E' }, // Figma red-orange
];

export const LINKS = [
  { label: 'Instagram', handle: '@shauncena17', url: 'https://instagram.com/shauncena17' },
  { label: 'YouTube', handle: '@oma1036', url: 'https://youtube.com/@oma1036' },
  { label: 'Design Instagram', handle: '@omai.design', url: 'https://instagram.com/omai.design' },
  { label: 'PupASCII', handle: 'Collaborative project', url: 'https://pupascii.vercel.app' },
  { label: 'Email', handle: 'siashaun4@gmail.com', url: 'mailto:siashaun4@gmail.com' },
];
