import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AsciiSpline } from './AsciiSpline';
import { Pong } from './Pong';
import { Snake } from './Snake';
import { CrtErrorBoundary } from '@/components/crt/CrtErrorBoundary';
import { crtFlicker, crtJitter } from '@/components/crt/crt-flicker';
import { DESIGN_WORK, LINKS, PHOTO_WORK, TOOLS, VIDEOS } from '@/data/portfolio';
import type { FocusCard } from '@/components/ui/focus-cards';
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

const MOTD: { text: string; tone?: 'dim' | 'hot' | 'amber' }[] = [
  { text: 'SHAUN SIA — OMAI', tone: 'hot' },
  { text: 'Graphic Designer · UI/UX Designer · Video Editor · Creative Lead' },
  { text: '' },
  { text: 'Pick a program below, press 1-6, or type HELP.', tone: 'dim' },
];

// Shown if the 3D hero can't run (no WebGL/WebGPU).
const FALLBACK_LOGO = [
  '  ___  __  __    _    ___ ',
  ' / _ \\|  \\/  |  / \\  |_ _|',
  '| | | | |\\/| | / _ \\  | | ',
  '| |_| | |  | |/ ___ \\ | | ',
  ' \\___/|_|  |_/_/   \\_\\___|',
].join('\n');

const fileName = (title: string, ext: string) =>
  title.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '') + ext;

const galleryItems = (which: Gallery): FocusCard[] => (which === 'design' ? DESIGN_WORK : PHOTO_WORK);
const galleryExt = (which: Gallery) => (which === 'design' ? '.PNG' : '.JPG');

function clockNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function TerminalSite() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState('');
  const [viewer, setViewer] = useState<{ which: Gallery; index: number } | null>(null);
  const [game, setGame] = useState<'pong' | 'snake' | null>(null);
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
      ...BOOT.map((l) => () => push([{ kind: 'text', ...l }])),
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
    if (booted && !viewer && !game) inputRef.current?.focus({ preventScroll: true });
  }, [booted, viewer, game]);

  const openGallery = useCallback((which: Gallery, index: number) => {
    const items = galleryItems(which);
    setViewer({ which, index: ((index % items.length) + items.length) % items.length });
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
          out.push({ kind: 'gallery', which });
          if (Number.isFinite(n)) openGallery(which, n - 1);
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
        case 'snake':
          out.push({ kind: 'text', text: 'Loading SNAKE.EXE…', tone: 'dim' });
          setGame('snake');
          break;
        case 'sudo':
          out.push({ kind: 'text', text: 'Nice try.', tone: 'amber' });
          break;
        case 'gui':
        case 'exit':
          out.push({ kind: 'text', text: 'Starting graphical mode…', tone: 'dim' });
          (window.top ?? window).location.href = '/?screen';
          break;
        default:
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
        return <GalleryList which={e.which} onOpen={openGallery} />;
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
      if (!viewer && !game && booted && (ev.target as HTMLElement).closest('button, a, input') == null &&
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
          index={viewer.index}
          onNav={(d) => openGallery(viewer.which, viewer.index + d)}
          onClose={() => setViewer(null)}
        />
      )}

      {game === 'pong' && (
        <Pong
          onClose={([you, cpu]) => {
            setGame(null);
            push([{ kind: 'text', text: `PONG.EXE exited. YOU ${you} — CPU ${cpu}`, tone: you > cpu ? 'hot' : 'dim' }]);
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
    ['PHOTO [n]', 'Photography files, open file n'],
    ['ABOUT', 'Who is Omai'],
    ['TOOLS', 'Installed programs'],
    ['CONTACT', 'Email and socials'],
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

function GalleryList({ which, onOpen }: { which: Gallery; onOpen: (w: Gallery, i: number) => void }) {
  const items = galleryItems(which);
  const ext = galleryExt(which);
  const handle = which === 'design' ? '@omai.design' : '@shauncena17';
  return (
    <div className="tty-block">
      <div className="tty-line tty-dim"> Directory of C:\OMAI\{which.toUpperCase()}</div>
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
      <div
        className="tty-table"
        style={{ gridTemplateColumns: which === 'design' ? '48px auto 1fr' : '48px auto auto 1fr' }}
      >
        {items.map((it, i) => (
          <button key={it.title} type="button" className="tty-row" onClick={() => onOpen(which, i)}>
            <span className="tty-dim">{i + 1}.</span>
            <span className="tty-hot">{fileName(it.title, ext)}</span>
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
      <div className="tty-line tty-dim">
        {items.length} file(s) · click a file or type {which.toUpperCase()} 1-{items.length} ·{' '}
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

function About() {
  return (
    <div className="tty-block" style={{ maxWidth: 980 }}>
      <div className="tty-line tty-dim">TYPE ABOUT.TXT</div>
      <div className="tty-line">
        Hi! I'm <span className="tty-hot">Shaun Sia</span>, otherwise known as{' '}
        <span className="tty-hot">Omai</span> online. I'm a Graphic Designer and UI/UX Designer with
        extensive experience leading creative teams.
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
  index,
  onNav,
  onClose,
}: {
  which: Gallery;
  index: number;
  onNav: (delta: number) => void;
  onClose: () => void;
}) {
  const items = galleryItems(which);
  const it = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
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
            C:\OMAI\{which.toUpperCase()}\{fileName(it.title, galleryExt(which))}
          </span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close">
            [X]
          </button>
        </div>
        <div className="tty-window-body">
          {it.src && <img key={it.src} src={it.src} alt={it.title} />}
          <div className="tty-window-text">
            <h2>{it.title}</h2>
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
                <div>
                  <span className="tty-dim">LOCATION </span>
                  {it.location}
                </div>
                <div>
                  <span className="tty-dim">CAMERA   </span>
                  {it.camera}
                </div>
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
            {index + 1} / {items.length} · ← → · ESC
          </span>
          <button type="button" onClick={() => onNav(1)}>
            NEXT ▶
          </button>
        </div>
      </div>
    </div>
  );
}
