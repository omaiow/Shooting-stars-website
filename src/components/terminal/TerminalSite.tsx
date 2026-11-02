import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AsciiSpline } from './AsciiSpline';
import { Arcade, type ArcadeKind } from './Arcade';
import { Pong } from './Pong';
import { Snake } from './Snake';
import { CrtErrorBoundary } from '@/components/crt/CrtErrorBoundary';
import { crtFlicker, crtJitter } from '@/components/crt/crt-flicker';
import { crtSound, installPointerSounds, sfx } from '@/components/crt/crt-sound';
import {
  DESIGN_WORK,
  LINKS,
  PHOTO_WORK,
  TOOLS,
  VIDEOS,
  findProject,
  looseWork,
  projectWork,
  projectsIn,
  type Project,
  type ProjectId,
  type WorkItem,
} from '@/data/portfolio';
import './terminal.css';

/**
 * TerminalSite — the portfolio as a green-phosphor terminal, shown inside the
 * 3D CRT (route: /?tty). The original site stays at /?screen (Full screen).
 *
 * Everything is clickable (menu, key bar, file listings) and also typeable:
 * HELP, VIDEO, DESIGN [n], PHOTO [n], ABOUT, TOOLS, CONTACT, CLS, GUI…
 */

type Gallery = 'design' | 'photo';

type Entry =
  | { id: number; kind: 'text'; text: string; tone?: 'dim' | 'hot' | 'amber' }
  | { id: number; kind: 'cmd'; text: string }
  | { id: number; kind: 'hero' }
  | { id: number; kind: 'menu' }
  | { id: number; kind: 'help' }
  | { id: number; kind: 'video' }
  | { id: number; kind: 'gallery'; which: Gallery }
  | { id: number; kind: 'folder'; project: ProjectId }
  | { id: number; kind: 'about' }
  | { id: number; kind: 'tools' }
  | { id: number; kind: 'contact' };

type NewEntry = Entry extends infer E ? (E extends Entry ? Omit<E, 'id'> : never) : never;

const PROMPT = 'C:\\OMAI>';

const PROGRAMS = [
  { key: '1', cmd: 'VIDEO', label: 'VIDEO' },
  { key: '2', cmd: 'DESIGN', label: 'DESIGN' },
  { key: '3', cmd: 'PHOTO', label: 'PHOTO' },
  { key: '4', cmd: 'ABOUT', label: 'ABOUT' },
  { key: '5', cmd: 'TOOLS', label: 'TOOLS' },
  { key: '6', cmd: 'CONTACT', label: 'CONTACT' },
];

const BOOT: { text: string; tone?: 'dim' | 'hot' | 'amber' }[] = [
  { text: 'SHOOTING STARS BIOS v2.6        (C) 2026 Shooting Stars Studio', tone: 'dim' },
  { text: 'Memory test ............ 640K OK', tone: 'dim' },
  { text: 'Detecting drives ....... A: FLOPPY   C: OMAI-HDD', tone: 'dim' },
  { text: 'Loading OMAI.SYS ....... OK', tone: 'dim' },
  { text: 'Mounting \\VIDEO \\DESIGN \\PHOTO ... OK', tone: 'dim' },
  { text: '' },
];

/** Phones/tablets: don't pop the on-screen keyboard unless they tap the prompt. */
const TOUCH =
  typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches;

const MOTD: { text: string; tone?: 'dim' | 'hot' | 'amber' }[] = [
  { text: 'SHAUN SIA — OMAI', tone: 'hot' },
  { text: 'Graphic Designer · Video Editor · Creative Lead' },
  { text: '' },
  {
    text: TOUCH ? 'Tap a program below, or type HELP.' : 'Pick a program below, press 1-6, or type HELP.',
    tone: 'dim',
  },
];

// Shown if the 3D hero can't run (no WebGL/WebGPU).
const FALLBACK_LOGO = [
  '  ___  __  __    _    ___ ',
  ' / _ \\|  \\/  |  / \\  |_ _|',
  '| | | | |\\/| | / _ \\  | | ',
  '| |_| | |  | |/ ___ \\ | | ',
  ' \\___/|_|  |_/_/   \\_\\___|',
].join('\n');

/** Commands that "read from disk" (a little hard-drive chatter when run). */
const DISK_COMMANDS = new Set([
  'help', '?', 'video', 'videos', 'tapes', 'design', 'photo', 'photos', 'about', 'whoami', 'type',
  'tools', 'contact', 'menu', 'cd', 'open', 'dir', 'ls', 'pong', 'beast', 'snake', 'breakout', 'tetris', 'invaders', 'spaceinvaders',
]);

const fileName = (title: string, ext: string) =>
  title.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '') + ext;

const galleryItems = (which: Gallery): WorkItem[] => (which === 'design' ? DESIGN_WORK : PHOTO_WORK);
const projectById = (id: ProjectId) => findProject(id) as Project;
/** The files shown in one directory: a project folder, or the loose work in DESIGN / PHOTO. */
const dirItems = (which: Gallery, project: ProjectId | null) =>
  project ? projectWork(galleryItems(which), project) : looseWork(galleryItems(which));
/** File name as listed, e.g. DAY06_THE_COLLEGE_DREAM.PNG */
const itemFile = (it: WorkItem, which: Gallery) =>
  (it.day ? `DAY${String(it.day).padStart(2, '0')}_` : '') + fileName(it.title, galleryExt(which));

type ViewerState = { which: Gallery; project: ProjectId | null; index: number };
const galleryExt = (which: Gallery) => (which === 'design' ? '.PNG' : '.JPG');

function clockNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function TerminalSite() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState('');
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  /** Directory last listed, for CD .. and DIR. */
  const cwd = useRef<{ which: Gallery; project: ProjectId | null } | null>(null);
  const [game, setGame] = useState<'pong' | 'snake' | 'beast' | ArcadeKind | null>(null);
  const [clock, setClock] = useState(clockNow);
  const nextId = useRef(1);
  const history = useRef<string[]>([]);
  const historyPos = useRef(-1);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollToId = useRef<number | null>(null);
  const bootStarted = useRef(false);
  const flickerRef = useRef<HTMLDivElement>(null);

  const push = useCallback((items: NewEntry[], scrollTo = false) => {
    setEntries((prev) => {
      const added = items.map((e) => ({ ...e, id: nextId.current++ }) as Entry);
      if (scrollTo && added.length) scrollToId.current = added[0].id;
      return [...prev, ...added];
    });
  }, []);

  // Boot sequence, then the ASCII hero and the menu.
  useEffect(() => {
    if (bootStarted.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const steps: (() => void)[] = [
      ...BOOT.map((l, i) => () => {
        push([{ kind: 'text', ...l }]);
        if (i === 0) crtSound.beep('post');
        if (i === 2) crtSound.drives();
      }),
      () => push([{ kind: 'hero' }]),
      () => push(MOTD.map((l) => ({ kind: 'text' as const, ...l }))),
      () => {
        push([{ kind: 'menu' }]);
        setBooted(true);
      },
    ];
    if (reduce) {
      bootStarted.current = true;
      steps.forEach((s) => s());
      return;
    }
    const timers = steps.map((s, i) =>
      window.setTimeout(() => {
        bootStarted.current = true;
        s();
      }, 180 + i * 140),
    );
    return () => timers.forEach(clearTimeout);
  }, [push]);

  // Tube flicker, shared with the 3D screen lights (same clock-based signal).
  useEffect(() => {
    const el = flickerRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const now = Date.now();
      const screen = screenRef.current;
      if (reduce.matches) {
        el.style.opacity = '0';
        if (screen) screen.style.transform = '';
      } else {
        el.style.opacity = String(Math.max(0, 1 - crtFlicker(now)));
        const jolt = crtJitter(now);
        if (screen) screen.style.transform = jolt ? `translateX(${jolt}px)` : '';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Mouse clicks and hover ticks.
  useEffect(() => installPointerSounds(), []);

  // Windows opening and closing; each picture "scans" in.
  const lastViewer = useRef(viewer);
  useEffect(() => {
    const was = lastViewer.current;
    lastViewer.current = viewer;
    if (viewer && !was) sfx('open');
    if (!viewer && was) sfx('close');
    if (viewer && (!was || was.index !== viewer.index || was.which !== viewer.which || was.project !== viewer.project)) {
      sfx('scan');
    }
  }, [viewer]);
  const lastGame = useRef(game);
  useEffect(() => {
    const was = lastGame.current;
    lastGame.current = game;
    if (game && !was) sfx('open');
    if (!game && was) sfx('close');
  }, [game]);

  // Keyboard clicks for key presses on the terminal (not while a game runs).
  const gameOpen = useRef(false);
  useEffect(() => {
    gameOpen.current = game != null;
  }, [game]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOpen.current || e.repeat) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
      crtSound.key(e.key === 'Enter' ? 'enter' : 'key');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setClock(clockNow()), 20_000);
    return () => clearInterval(t);
  }, []);

  // Keep the newest command in view (its output reads top-down from there).
  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const id = scrollToId.current;
    if (id != null) {
      scrollToId.current = null;
      screen.querySelector(`[data-entry="${id}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else if (!booted) {
      screen.scrollTop = screen.scrollHeight;
    }
  }, [entries, booted]);

  useEffect(() => {
    if (booted && !viewer && !game && !TOUCH) inputRef.current?.focus({ preventScroll: true });
  }, [booted, viewer, game]);

  const openGallery = useCallback((which: Gallery, index: number, project: ProjectId | null = null) => {
    const items = dirItems(which, project);
    if (!items.length) return;
    setViewer({ which, project, index: ((index % items.length) + items.length) % items.length });
  }, []);

  const run = useCallback(
    (raw: string) => {
      const text = raw.trim();
      const out: NewEntry[] = [{ kind: 'cmd', text }];
      if (text) {
        history.current = [text, ...history.current.filter((h) => h !== text)].slice(0, 30);
      }
      historyPos.current = -1;

      const [word = '', ...rest] = text.toLowerCase().split(/\s+/);
      const arg = rest.join(' ');
      const n = Number.parseInt(arg, 10);
      if (DISK_COMMANDS.has(word)) sfx('seek');

      switch (word) {
        case '':
          break;
        case 'help':
        case '?':
          out.push({ kind: 'help' });
          break;
        case 'video':
        case 'videos':
        case 'tapes':
          out.push({ kind: 'video' });
          break;
        case 'design':
        case 'photo':
        case 'photos': {
          const which: Gallery = word === 'design' ? 'design' : 'photo';
          const folder = findProject(rest[0] ?? '');
          if (folder && folder.gallery === which) {
            cwd.current = { which, project: folder.id };
            out.push({ kind: 'folder', project: folder.id });
            const k = Number.parseInt(rest[1] ?? '', 10);
            if (Number.isFinite(k)) openGallery(which, k - 1, folder.id);
            break;
          }
          cwd.current = { which, project: null };
          out.push({ kind: 'gallery', which });
          if (Number.isFinite(n)) openGallery(which, n - 1);
          break;
        }
        case 'cd':
        case 'open': {
          const target = arg.replace(/\\|\//g, '').trim();
          if (target === '..' || target === '') {
            const here = cwd.current;
            if (here?.project) {
              cwd.current = { which: here.which, project: null };
              out.push({ kind: 'gallery', which: here.which });
            } else {
              cwd.current = null;
              out.push({ kind: 'menu' });
            }
            break;
          }
          if (target === 'design' || target === 'photo') {
            cwd.current = { which: target, project: null };
            out.push({ kind: 'gallery', which: target });
            break;
          }
          const folder = findProject(target);
          if (folder) {
            cwd.current = { which: folder.gallery, project: folder.id };
            out.push({ kind: 'folder', project: folder.id });
          } else {
            crtSound.beep('error');
            out.push({ kind: 'text', text: `The system cannot find the path specified: ${target.toUpperCase()}`, tone: 'amber' });
          }
          break;
        }
        case 'dir':
        case 'ls': {
          const here = cwd.current;
          if (here?.project) out.push({ kind: 'folder', project: here.project });
          else if (here) out.push({ kind: 'gallery', which: here.which });
          else out.push({ kind: 'menu' });
          break;
        }
        case 'about':
        case 'whoami':
        case 'type':
          out.push({ kind: 'about' });
          break;
        case 'tools':
          out.push({ kind: 'tools' });
          break;
        case 'contact':
          out.push({ kind: 'contact' });
          break;
        case 'cls':
        case 'clear':
          sfx('wipe');
          setEntries([]);
          return;
        case 'menu':
          out.push({ kind: 'menu' });
          break;
        case 'date':
        case 'time':
          out.push({ kind: 'text', text: new Date().toString() });
          break;
        case 'echo':
          out.push({ kind: 'text', text: text.slice(5) });
          break;
        case 'pong':
          out.push({ kind: 'text', text: 'Loading PONG.EXE…', tone: 'dim' });
          setGame('pong');
          break;
        case 'beast':
          out.push({ kind: 'text', text: 'Loading BEAST.EXE…', tone: 'dim' });
          setGame('beast');
          break;
        case 'snake':
          out.push({ kind: 'text', text: 'Loading SNAKE.EXE…', tone: 'dim' });
          setGame('snake');
          break;
        case 'breakout':
          out.push({ kind: 'text', text: 'Loading BREAKOUT.EXE…', tone: 'dim' });
          setGame('breakout');
          break;
        case 'tetris':
          out.push({ kind: 'text', text: 'Loading TETRIS.EXE…', tone: 'dim' });
          setGame('tetris');
          break;
        case 'invaders':
        case 'spaceinvaders':
          out.push({ kind: 'text', text: 'Loading INVADERS.EXE…', tone: 'dim' });
          setGame('invaders');
          break;
        case 'sudo':
          crtSound.beep('error');
          out.push({ kind: 'text', text: 'Nice try.', tone: 'amber' });
          break;
        case 'gui':
        case 'exit':
          out.push({ kind: 'text', text: 'Starting graphical mode…', tone: 'dim' });
          // Switch the tube off (with its sound) before leaving.
          crtSound.powerOff();
          window.setTimeout(() => {
            (window.top ?? window).location.href = '/?screen';
          }, 450);
          break;
        default:
          crtSound.beep('error');
          out.push({ kind: 'text', text: 'Bad command or file name. Type HELP.', tone: 'amber' });
      }
      push(out, true);
    },
    [openGallery, push],
  );

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      historyPos.current =
        e.key === 'ArrowUp'
          ? Math.min(h.length - 1, historyPos.current + 1)
          : Math.max(-1, historyPos.current - 1);
      setInput(historyPos.current === -1 ? '' : h[historyPos.current]);
    } else if (input === '' && /^[1-6]$/.test(e.key)) {
      e.preventDefault();
      run(PROGRAMS[Number(e.key) - 1].cmd);
    }
  };

  const renderEntry = (e: Entry): ReactNode => {
    switch (e.kind) {
      case 'text':
        return <div className={`tty-line${e.tone ? ` tty-${e.tone}` : ''}`}>{e.text}</div>;
      case 'cmd':
        return (
          <div className="tty-line">
            <span className="tty-dim">{PROMPT}</span> <span className="tty-hot">{e.text}</span>
          </div>
        );
      case 'hero':
        return (
          <CrtErrorBoundary fallback={<pre className="tty-line tty-hot">{FALLBACK_LOGO}</pre>}>
            <AsciiSpline scene="/assets/hero.splinecode" className="tty-hero" fontSize={9} crop={0.42} />
          </CrtErrorBoundary>
        );
      case 'menu':
        return <Menu onRun={run} />;
      case 'help':
        return <Help />;
      case 'video':
        return <VideoList />;
      case 'gallery':
        return <GalleryList which={e.which} onOpen={openGallery} onRun={run} />;
      case 'folder':
        return <FolderList project={projectById(e.project)} onOpen={openGallery} />;
      case 'about':
        return <About />;
      case 'tools':
        return <ToolBars />;
      case 'contact':
        return <Contact />;
    }
  };

  return (
    <div className="tty" onClick={(ev) => {
      // Clicking empty terminal space returns focus to the prompt (not when selecting text).
      if (!TOUCH && !viewer && !game && booted && (ev.target as HTMLElement).closest('button, a, input') == null &&
          !window.getSelection()?.toString()) {
        inputRef.current?.focus({ preventScroll: true });
      }
    }}>
      <div className="tty-bar" role="banner">
        <span>SHOOTING STARS OS 2.6 │ OMAI.SYS</span>
        <span>GUEST │ {clock}</span>
      </div>

      <div className="tty-screen" ref={screenRef} role="log" aria-live="polite">
        {entries.map((e) => (
          <div key={e.id} data-entry={e.id}>
            {renderEntry(e)}
          </div>
        ))}
        {booted && (
          <label className="tty-prompt">
            <span className="tty-dim">{PROMPT}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKey}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal command"
            />
          </label>
        )}
      </div>

      <nav className="tty-keys" aria-label="Programs">
        <button type="button" className="tty-key" onClick={() => run('HELP')}>
          <b>?</b>HELP
        </button>
        {PROGRAMS.map((p) => (
          <button key={p.key} type="button" className="tty-key" onClick={() => run(p.cmd)}>
            <b>{p.key}</b>
            {p.label}
          </button>
        ))}
        <button type="button" className="tty-key" onClick={() => run('GUI')}>
          <b>G</b>GUI MODE
        </button>
      </nav>

      <div ref={flickerRef} className="tty-flicker" aria-hidden="true" />

      {viewer && (
        <Viewer
          which={viewer.which}
          project={viewer.project}
          index={viewer.index}
          onNav={(d) => openGallery(viewer.which, viewer.index + d, viewer.project)}
          onClose={() => setViewer(null)}
        />
      )}

      {(game === 'pong' || game === 'beast') && (
        <Pong
          startWithLossJoke={game === 'beast'}
          onClose={([you, cpu]) => {
            setGame(null);
            push([
              {
                kind: 'text',
                text: game === 'beast' ? 'BEAST.EXE exited.' : `PONG.EXE exited. YOU ${you} — CPU ${cpu}`,
                tone: game === 'beast' || you > cpu ? 'hot' : 'dim',
              },
            ]);
          }}
        />
      )}
      {game === 'snake' && (
        <Snake
          onClose={(score, best) => {
            setGame(null);
            push([{ kind: 'text', text: `SNAKE.EXE exited. SCORE ${score} · BEST ${best}`, tone: 'dim' }]);
          }}
        />
      )}
      {(game === 'breakout' || game === 'tetris' || game === 'invaders') && (
        <Arcade
          kind={game}
          onClose={(score) => {
            const title = game.toUpperCase();
            setGame(null);
            push([{ kind: 'text', text: `${title}.EXE exited. SCORE ${score}`, tone: 'dim' }]);
          }}
        />
      )}
    </div>
  );
}

/* ── Programs ─────────────────────────────────────────────────────────── */

function Menu({ onRun }: { onRun: (cmd: string) => void }) {
  return (
    <div className="tty-menu tty-block">
      {PROGRAMS.map((p) => (
        <button key={p.key} type="button" onClick={() => onRun(p.cmd)}>
          [{p.key}] {p.label}
        </button>
      ))}
    </div>
  );
}

function Help() {
  const rows: [string, string][] = [
    ['VIDEO', 'Edits on tape — opens on YouTube'],
    ['DESIGN [n]', 'Graphic design files, open file n'],
    ['CD <folder>', 'Open a project folder, e.g. CD 30DAYS · CD .. to go back'],
    ['PHOTO [n]', 'Photography files, open file n'],
    ['ABOUT', 'Who is Omai'],
    ['TOOLS', 'Installed programs'],
    ['CONTACT', 'Email and socials'],
    ['GAMES', 'PONG, SNAKE, BREAKOUT, TETRIS, INVADERS, BEAST'],
    ['CLS', 'Clear the screen'],
    ['GUI', 'Switch to the full graphical site'],
  ];
  return (
    <div className="tty-block">
      <div className="tty-table" style={{ gridTemplateColumns: '180px 1fr' }}>
        {rows.map(([c, d]) => (
          <div key={c} className="tty-row">
            <span className="tty-hot">{c}</span>
            <span className="tty-dim">{d}</span>
          </div>
        ))}
      </div>
      <div className="tty-line tty-dim">↑/↓ recall commands · keys 1-6 run programs</div>
    </div>
  );
}

function VideoList() {
  return (
    <div className="tty-block">
      <div className="tty-line tty-dim"> Directory of C:\OMAI\VIDEO</div>
      <div className="tty-table" style={{ gridTemplateColumns: '120px 1fr auto' }}>
        {VIDEOS.map((v, i) => (
          <div key={v.id} className="tty-row">
            <span className="tty-dim">TAPE_0{i + 1}</span>
            <span>{v.title}</span>
            <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">
              ▶ PLAY
            </a>
          </div>
        ))}
      </div>
      <div className="tty-line tty-dim">
        {VIDEOS.length} tape(s) · edited in CapCut and DaVinci Resolve ·{' '}
        <a href="https://youtube.com/@oma1036" target="_blank" rel="noopener noreferrer">
          @oma1036
        </a>
      </div>
    </div>
  );
}

function GalleryList({
  which,
  onOpen,
  onRun,
}: {
  which: Gallery;
  onOpen: (w: Gallery, i: number, project?: ProjectId | null) => void;
  onRun: (cmd: string) => void;
}) {
  const items = looseWork(galleryItems(which));
  const folders = projectsIn(which);
  const handle = which === 'design' ? '@omai.design' : '@shauncena17';
  return (
    <div className="tty-block">
      <div className="tty-line tty-dim"> Directory of C:\OMAI\{which.toUpperCase()}</div>
      {folders.map((f) => {
        const all = projectWork(galleryItems(which), f.id);
        const best = all.filter((it) => it.best);
        return (
          <div key={f.id} className="tty-folder">
            <button type="button" className="tty-folder-head" onClick={() => onRun(`CD ${f.folder}`)}>
              <span className="tty-dim">&lt;DIR&gt;</span>
              <span className="tty-hot">{f.folder}</span>
              <span>{f.title}</span>
              <span className="tty-dim">{all.length} files · open ▸</span>
            </button>
            <div className="tty-thumbs tty-thumbs-mini">
              {best.map((it) => (
                <button
                  key={it.title}
                  type="button"
                  className="tty-thumb"
                  onClick={() => onOpen(which, all.indexOf(it), f.id)}
                  aria-label={`Open ${it.title}`}
                >
                  {it.src && <img src={it.src} alt="" loading="lazy" />}
                  <span>★</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      <div className="tty-thumbs">
        {items.map((it, i) => (
          <button
            key={it.title}
            type="button"
            className="tty-thumb"
            onClick={() => onOpen(which, i)}
            aria-label={`Open ${it.title}`}
          >
            {it.src && <img src={it.src} alt="" loading="lazy" />}
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      <FileTable which={which} items={items} onOpen={(i) => onOpen(which, i)} />
      <div className="tty-line tty-dim">
        {folders.length} folder(s) · {items.length} file(s) · click a file, type {which.toUpperCase()} 1-
        {items.length} or CD {folders[0]?.folder} ·{' '}
        <a
          href={`https://instagram.com/${handle.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {handle}
        </a>
      </div>
    </div>
  );
}

function FileTable({
  which,
  items,
  onOpen,
}: {
  which: Gallery;
  items: WorkItem[];
  onOpen: (i: number) => void;
}) {
  return (
    <div
      className="tty-table"
      style={{ gridTemplateColumns: which === 'design' ? '48px auto 1fr' : '48px auto auto 1fr' }}
    >
      {items.map((it, i) => (
        <button key={it.title} type="button" className="tty-row" onClick={() => onOpen(i)}>
          <span className="tty-dim">{i + 1}.</span>
          <span className="tty-hot">
            {itemFile(it, which)}
            {it.best ? ' ★' : ''}
          </span>
          {which === 'design' ? (
            <span className="tty-dim">{it.software?.map((s) => s.name).join(', ')}</span>
          ) : (
            <>
              <span className="tty-dim">{it.location}</span>
              <span className="tty-dim">{it.camera}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

function FolderList({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (w: Gallery, i: number, project?: ProjectId | null) => void;
}) {
  const which = project.gallery;
  const items = projectWork(galleryItems(which), project.id);
  const best = items.filter((it) => it.best);
  return (
    <div className="tty-block">
      <div className="tty-line tty-dim">
        {' '}
        Directory of C:\OMAI\{which.toUpperCase()}\{project.folder}
      </div>
      <div className="tty-line tty-hot">{project.title}</div>
      <div className="tty-line" style={{ maxWidth: 980 }}>
        {project.blurb}
      </div>
      <div className="tty-line tty-dim">&nbsp;</div>
      <div className="tty-line tty-amber">★ HIGHLIGHTS</div>
      <div className="tty-thumbs tty-thumbs-best">
        {best.map((it) => (
          <button
            key={it.title}
            type="button"
            className="tty-thumb"
            onClick={() => onOpen(which, items.indexOf(it), project.id)}
            aria-label={`Open ${it.title}`}
          >
            {it.src && <img src={it.src} alt="" loading="lazy" />}
            <span>★ {it.day ?? items.indexOf(it) + 1}</span>
          </button>
        ))}
      </div>
      <div className="tty-line tty-dim">ALL FILES</div>
      <div className="tty-thumbs">
        {items.map((it, i) => (
          <button
            key={it.title}
            type="button"
            className="tty-thumb"
            onClick={() => onOpen(which, i, project.id)}
            aria-label={`Open ${it.title}`}
          >
            {it.src && <img src={it.src} alt="" loading="lazy" />}
            <span>{it.day ?? i + 1}</span>
          </button>
        ))}
      </div>
      <FileTable which={which} items={items} onOpen={(i) => onOpen(which, i, project.id)} />
      <div className="tty-line tty-dim">
        {items.length} file(s) · {best.length} highlighted ★ · type CD .. to go back
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="tty-block" style={{ maxWidth: 980 }}>
      <div className="tty-line tty-dim">TYPE ABOUT.TXT</div>
      <div className="tty-line">
        Hi! I'm <span className="tty-hot">Shaun Sia</span>, otherwise known as{' '}
        <span className="tty-hot">Omai</span> online. I'm a Graphic Designer with extensive
        experience leading creative teams, and I take on the occasional UI/UX project too.
      </div>
      <div className="tty-line">&nbsp;</div>
      <div className="tty-line">
        I specialize in Photoshop for graphics and photo manipulation, create short-form video
        content with CapCut and DaVinci Resolve, and dabble in photography as a creative pursuit.
      </div>
      <div className="tty-line">&nbsp;</div>
      <div className="tty-line">
        Currently in college, I'm leading creative committees for various campus organizations —
        just as I spearheaded the publication team in high school.
      </div>
    </div>
  );
}

function ToolBars() {
  const max = Math.max(...TOOLS.map((t) => t.years));
  return (
    <div className="tty-block">
      <div className="tty-line tty-dim">INSTALLED PROGRAMS</div>
      <div className="tty-bars">
        {TOOLS.map((t) => (
          <div key={t.name} style={{ display: 'contents' }}>
            <span className="tty-hot">{t.name.toUpperCase()}</span>
            <span aria-hidden="true">
              {'█'.repeat(t.years * 3)}
              <span className="tty-dim">{'░'.repeat((max - t.years) * 3)}</span>
            </span>
            <span className="tty-dim">{t.years} YRS</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="tty-block">
      <div className="tty-line tty-hot">LET'S WORK TOGETHER.</div>
      <div className="tty-line tty-dim">Open for creative collaborations, design projects, and video work.</div>
      <div className="tty-table" style={{ gridTemplateColumns: '220px 1fr' }}>
        {LINKS.map((l) => (
          <div key={l.label} className="tty-row">
            <span className="tty-dim">{l.label.toUpperCase()}</span>
            <a href={l.url} target={l.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
              {l.handle}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function Viewer({
  which,
  project,
  index,
  onNav,
  onClose,
}: {
  which: Gallery;
  project: ProjectId | null;
  index: number;
  onNav: (delta: number) => void;
  onClose: () => void;
}) {
  const items = dirItems(which, project);
  const folder = project ? projectById(project) : null;
  const it = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Next frame: focusing during the Enter that opened us would turn that
    // same Enter into a click on [X] and close the viewer straight away.
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onNav(1);
      else if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNav]);

  return (
    <div className="tty-window-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tty-window" role="dialog" aria-modal="true" aria-label={it.title}>
        <div className="tty-window-title">
          <span>
            C:\OMAI\{which.toUpperCase()}\{folder ? `${folder.folder}\\` : ''}
            {itemFile(it, which)}
          </span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close">
            [X]
          </button>
        </div>
        <div className="tty-window-body">
          {it.src && <img key={it.src} src={it.src} alt={it.title} />}
          <div className="tty-window-text">
            <h2>{it.title}</h2>
            {folder && (
              <div className="tty-dim">
                {folder.title.toUpperCase()}
                {it.day ? ` · DAY ${it.day}` : ''}
                {it.best ? ' · ★ HIGHLIGHT' : ''}
              </div>
            )}
            {which === 'design' ? (
              <>
                {it.description && <div>{it.description}</div>}
                {it.process && (
                  <>
                    <div className="tty-dim">PROCESS</div>
                    <div>{it.process}</div>
                  </>
                )}
                {it.software?.length ? (
                  <>
                    <div className="tty-dim">SOFTWARE</div>
                    {it.software.map((s) => (
                      <div key={s.name}>
                        <span className="tty-hot">{s.name.toUpperCase()}</span>{' '}
                        <span className="tty-dim">— {s.role}</span>
                      </div>
                    ))}
                  </>
                ) : null}
              </>
            ) : (
              <>
                {it.location && (
                  <div>
                    <span className="tty-dim">LOCATION </span>
                    {it.location}
                  </div>
                )}
                {it.camera && (
                  <div>
                    <span className="tty-dim">CAMERA   </span>
                    {it.camera}
                  </div>
                )}
                {it.thoughtProcess && <div>{it.thoughtProcess}</div>}
              </>
            )}
          </div>
        </div>
        <div className="tty-window-nav">
          <button type="button" onClick={() => onNav(-1)}>
            ◀ PREV
          </button>
          <span className="tty-dim">
            {index + 1} / {items.length}
            <span className="tty-keyhint"> · ← → · ESC</span>
          </span>
          <button type="button" onClick={() => onNav(1)}>
            NEXT ▶
          </button>
        </div>
      </div>
    </div>
  );
}
