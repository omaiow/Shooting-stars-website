/**
 * Portfolio content shared by the original site and the CRT terminal UI.
 * Edit work here once and both versions update.
 */
import type { FocusCard } from '@/components/ui/focus-cards';

export type ProjectId = '30days' | 'binondo';

/** A piece of work. Items with a `project` live in that project's folder. */
export type WorkItem = FocusCard & {
  project?: ProjectId;
  /** Showcased: shown outside the folder too (site grid, folder highlights). */
  best?: boolean;
  /** Day number, for the 30 Day Design Challenge. */
  day?: number;
};

export interface Project {
  id: ProjectId;
  /** Folder name in the terminal (C:\OMAI\DESIGN\30DAYS). */
  folder: string;
  title: string;
  blurb: string;
  gallery: 'design' | 'photo';
  /** Image that stands for the whole project. */
  cover: string;
}

export const PROJECTS: Project[] = [
  {
    id: '30days',
    folder: '30DAYS',
    title: '30 Day Design Challenge',
    blurb:
      'One piece a day, posted on @omai.design between February and March 2026 — Photoshop composites built around a feeling or a single line, in Filipino and English.',
    gallery: 'design',
    cover: '/assets/work/30days/recap.webp',
  },
  {
    id: 'binondo',
    folder: 'BINONDO',
    title: 'Shooting Star Productions — Binondo',
    blurb:
      "Shooting Star Productions' first shoot, a collab with Cassie: planned in a week on a tiny budget and shot in a single night around Binondo. Photography and creative direction by Shaun and Cassie; edited by Shaun.",
    gallery: 'photo',
    cover: '/assets/work/binondo/poster.webp',
  },
];

export const DESIGN_WORK: WorkItem[] = [
  {
    title: 'VEGAS',
    src: '/assets/work/vegas.webp',
    accentColor: '#3b82f6',
    description: 'Fan work: an unofficial Valorant × Formula 1 crossover poster for the Las Vegas race. A 3D agent and an F1 car charged with lightning, under heavy display type.',
  },
  {
    title: 'The Doorman',
    src: '/assets/work/the-doorman.webp',
    accentColor: '#3b82f6',
    description: 'A high-contrast poster: a lone silhouette in a blown-out doorway, crowned by a ring of keys.',
  },
  {
    title: 'Spider-Man: Brand New Day (Fan Poster)',
    src: '/assets/work/spider-man-brand-new-day.webp',
    accentColor: '#3b82f6',
    description: 'Fan work: an unofficial poster for Spider-Man: Brand New Day, not affiliated with Marvel or Sony. A lone figure on a ledge above the city at golden hour, with a cast strip under the title.',
  },
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
    title: 'Station 32',
    src: '/assets/work/station-32.webp',
    accentColor: '#3b82f6',
    description: 'A transit-map inspired identity system — wordmark, submark, a numbered colour set and a Coolvetica + Helvetica type pairing, built to roll out across posts and signage.',
  },
  {
    title: 'All Saints Day',
    src: '/assets/work/all-saints.webp',
    accentColor: '#3b82f6',
    description: 'A holiday post for PUP ASCII, pairing a classical painting with flowing script type.',
  },
  // 30 Day Design Challenge (in posting order; day 18, SANA, isn't exported yet)
  {
    title: 'Another Version of Me',
    src: '/assets/work/30days/another-version-of-me.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 1,
  },
  {
    title: 'Pinili Kitang Kaibiganin',
    src: '/assets/work/30days/pinili-kita.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 2,
  },
  {
    title: 'Memories',
    src: '/assets/work/30days/memories.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 3,
  },
  {
    title: 'Maling Biyahe',
    src: '/assets/work/30days/train-window.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 4,
  },
  {
    title: 'Love Is Louder Than Hate',
    src: '/assets/work/30days/beach-truck.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 5,
  },
  {
    title: 'The College Dream',
    src: '/assets/work/30days/college-dream.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 6,
    best: true,
    description: 'A surreal photo manipulation: a train door hung in an ornate gold frame on a weathered wall, like a painting of somewhere you would rather be.',
  },
  {
    title: 'About You',
    src: '/assets/work/30days/about-you.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 7,
  },
  {
    title: 'Stop',
    src: '/assets/work/30days/stop.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 8,
  },
  {
    title: 'Are We Still Friends?',
    src: '/assets/work/30days/are-we-still-friends.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 9,
  },
  {
    title: 'Better Together',
    src: "https://i.imgur.com/EylErww.jpeg",
    accentColor: '#3b82f6',
    project: '30days',
    day: 10,
    best: true,
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
    title: 'Crafting Table Ka Ba?',
    src: '/assets/work/30days/crafting-table.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 11,
  },
  {
    title: 'What a Wonderful View',
    src: '/assets/work/30days/wonderful-view.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 12,
  },
  {
    title: 'The Door',
    src: '/assets/work/30days/the-door.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 13,
  },
  {
    title: 'Di Na Kayo Support Club',
    src: '/assets/work/30days/di-na-kayo.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 14,
  },
  {
    title: 'We Remember',
    src: '/assets/work/30days/we-remember.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 15,
  },
  {
    title: 'A Promise in Binondo',
    src: '/assets/work/30days/a-promise-in-binondo.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 16,
  },
  {
    title: 'Umaasa',
    src: '/assets/work/30days/umaasa.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 17,
  },
  {
    title: "It's Me",
    src: '/assets/work/30days/its-me.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 19,
  },
  {
    title: 'The Universe Expanded Between Us',
    src: '/assets/work/30days/universe.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 20,
  },
  {
    title: 'Pick Up the Phone',
    src: '/assets/work/30days/pick-up-the-phone.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 21,
  },
  {
    title: "I'm Freezing Outside",
    src: '/assets/work/30days/freezing-outside.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 22,
  },
  {
    title: 'Sari-Sari',
    src: '/assets/work/30days/sari-sari.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 23,
  },
  {
    title: 'Fading',
    src: '/assets/work/30days/fading.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 24,
  },
  {
    title: 'Head in the Clouds',
    src: '/assets/work/30days/head-in-the-clouds.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 25,
  },
  {
    title: 'Kanibalismo',
    src: "https://i.imgur.com/sqi2r7K.jpeg",
    accentColor: '#3b82f6',
    project: '30days',
    day: 26,
    best: true,
    description: 'A Receipt inspired poster based off the song Pag-ibig ay Kanibalismo II by Fitterkarma',
    process: 'I made this poster as a part of a 30 day design challenge. I wanted to capture the essence of the song in a visual format. For me how the song represented the toxicity of love using cannibalism was really effective so i choose to lean into that with the butcher shop receipt.',
    software: [
      { name: 'Photoshop', role: 'Layout, type distortion & image treatment' },
      { name: 'Figma', role: 'Layout & vector graphics' },
    ],
  },
  {
    title: 'I Am Gonna Grow Wings',
    src: '/assets/work/30days/grow-wings.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 27,
  },
  {
    title: 'Repeat It!',
    src: '/assets/work/30days/repeat-it.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 28,
  },
  {
    title: 'Dashboard',
    src: '/assets/work/30days/dashboard.webp',
    accentColor: '#3b82f6',
    project: '30days',
    day: 29,
  },
];

export const PHOTO_WORK: WorkItem[] = [
  {
    title: 'The Wall',
    src: 'https://i.imgur.com/N7dSjW0.jpeg',
    accentColor: '#2563eb',
    location: 'Intramuros, Manila',
    camera: 'Sony Powershot SX430 IS',
    thoughtProcess: 'I was walking around Intramuros and i saw this wall with this window that was so compelling it felt serene and i just had to take a picture.',
  },
  {
    title: 'The Basilica',
    src: '/assets/work/quiapo.webp',
    accentColor: '#2563eb',
    location: 'Quiapo, Manila',
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
    title: 'After the Rain',
    src: '/assets/work/after-rain.webp',
    accentColor: '#2563eb',
    camera: 'iPhone 11',
  },
  {
    title: 'The Feeling',
    src: "https://i.imgur.com/02Y4tXT.jpeg",
    accentColor: '#2563eb',
    location: 'Smart Araneta Coliseum',
    camera: 'Sony Powershot SX430 IS',
    thoughtProcess: 'During the Chromokopia Tyler the Creator concert, I felt so moved by the performance that I had to capture the moment. I used the long exposure to capture the movement of the lights and the crowd.',
  },
  // Shooting Star Productions — Binondo shoot
  {
    title: 'The Stairs',
    src: '/assets/work/binondo/stairs.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    best: true,
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Arch',
    src: '/assets/work/binondo/arch.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    best: true,
    location: 'Binondo, Manila',
    camera: 'iPhone 11',
  },
  {
    title: 'The Call',
    src: '/assets/work/binondo/payphone.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    best: true,
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Ride',
    src: '/assets/work/binondo/bikes.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    best: true,
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Glow',
    src: '/assets/work/binondo/neon.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The River',
    src: '/assets/work/binondo/river.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Bridge',
    src: '/assets/work/binondo/bridge.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Boots',
    src: '/assets/work/binondo/orange-boots.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Point',
    src: '/assets/work/binondo/pointing.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Beat',
    src: '/assets/work/binondo/headphones.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Crew',
    src: '/assets/work/binondo/the-crew.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Lean',
    src: '/assets/work/binondo/wall.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
  {
    title: 'The Corner',
    src: '/assets/work/binondo/fishnets.webp',
    accentColor: '#2563eb',
    project: 'binondo',
    location: 'Binondo, Manila',
    camera: 'Nikon D7200',
  },
];

/** Work that isn't inside a project folder. */
export const looseWork = <T extends WorkItem>(items: T[]) => items.filter((i) => !i.project);

/** Everything in one project, in order. */
export const projectWork = <T extends WorkItem>(items: T[], id: ProjectId) =>
  items.filter((i) => i.project === id);

/** What the original site's grids show: the best of each project first, then loose work. */
export const showcase = <T extends WorkItem>(items: T[]) => [
  ...items.filter((i) => i.project && i.best),
  ...looseWork(items),
];

export const projectsIn = (gallery: 'design' | 'photo') => PROJECTS.filter((p) => p.gallery === gallery);

export const findProject = (name: string) =>
  PROJECTS.find((p) => p.folder.toLowerCase() === name.toLowerCase() || p.id === name.toLowerCase());

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
