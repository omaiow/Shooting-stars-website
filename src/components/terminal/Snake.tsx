import { useEffect, useRef } from 'react';
import { sfx } from '@/components/crt/crt-sound';

/**
 * Snake — secret program (type SNAKE). Eat to grow, don't hit the walls or
 * yourself. It speeds up as you eat. Arrows/WASD or swipe to steer, SPACE to
 * start, ESC to quit. Best score is kept in this browser.
 */

const COLS = 32;
const ROWS = 20;
const CELL = 25;
const W = COLS * CELL;
const H = ROWS * CELL;
const START_TICK = 130; // ms per move
const MIN_TICK = 60;
const TICK_STEP = 3; // faster per food
const BEST_KEY = 'tty-snake-best';

type Cell = { x: number; y: number };
type Dir = Cell;

const DIRS: Record<string, Dir> = {
  arrowup: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  arrowdown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  arrowleft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  arrowright: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
};

type Game = {
  snake: Cell[]; // head first
  dir: Dir;
  queue: Dir[]; // buffered turns, so quick double-taps aren't lost
  food: Cell;
  score: number;
  best: number;
  state: 'ready' | 'playing' | 'dead';
  tick: number;
  acc: number;
};

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    // storage blocked — best score just won't persist
  }
}

function placeFood(snake: Cell[]): Cell {
  const free: Cell[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

function newGame(best: number): Game {
  const cy = Math.floor(ROWS / 2);
  const snake = [4, 3, 2].map((x) => ({ x, y: cy }));
  return {
    snake,
    dir: { x: 1, y: 0 },
    queue: [],
    food: placeFood(snake),
    score: 0,
    best,
    state: 'ready',
    tick: START_TICK,
    acc: 0,
  };
}

function turn(g: Game, d: Dir) {
  const last = g.queue[g.queue.length - 1] ?? g.dir;
  if ((d.x === -last.x && d.y === -last.y) || (d.x === last.x && d.y === last.y)) return;
  if (g.queue.length < 2) g.queue.push(d);
}

function move(g: Game) {
  g.dir = g.queue.shift() ?? g.dir;
  const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
  const eating = head.x === g.food.x && head.y === g.food.y;
  // The tail moves out of the way this tick unless we're growing.
  const body = eating ? g.snake : g.snake.slice(0, -1);
  if (
    head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
    body.some((s) => s.x === head.x && s.y === head.y)
  ) {
    g.state = 'dead';
    if (g.score > g.best) {
      g.best = g.score;
      saveBest(g.best);
    }
    return;
  }
  g.snake = [head, ...body];
  if (eating) {
    g.score++;
    g.tick = Math.max(MIN_TICK, g.tick - TICK_STEP);
    g.food = placeFood(g.snake);
  }
}

function draw(ctx: CanvasRenderingContext2D, g: Game, now: number) {
  const fg = '#7dff8a';
  const hot = '#d6ffd9';
  const faint = '#0c2512';
  ctx.fillStyle = '#020703';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = faint;
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);

  ctx.shadowColor = 'rgb(125 255 138 / 60%)';
  ctx.shadowBlur = 10;

  // Food blinks like a cursor.
  if (Math.floor(now / 400) % 2 === 0 || g.state !== 'playing') {
    ctx.fillStyle = '#ffcf5a';
    ctx.fillRect(g.food.x * CELL + 6, g.food.y * CELL + 6, CELL - 12, CELL - 12);
  }

  g.snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? hot : fg;
    ctx.fillRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4);
  });

  ctx.fillStyle = fg;
  ctx.font = '28px VT323, monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${g.score}`, 12, 8);
  ctx.textAlign = 'right';
  ctx.fillText(`BEST ${g.best}`, W - 12, 8);

  if (g.state !== 'playing') {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '32px VT323, monospace';
    if (g.state === 'dead') {
      ctx.fillStyle = '#ffcf5a';
      ctx.fillText(g.score >= g.best && g.score > 0 ? 'NEW BEST!' : 'GAME OVER', W / 2, H / 2 - 22);
      ctx.fillStyle = fg;
      ctx.fillText('SPACE: PLAY AGAIN   ESC: QUIT', W / 2, H / 2 + 22);
    } else {
      ctx.fillStyle = hot;
      ctx.fillText('PRESS SPACE TO START', W / 2, H / 2);
    }
  }
  ctx.shadowBlur = 0;
}

export function Snake({ onClose }: { onClose: (score: number, best: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game>(newGame(readBest()));
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const start = () => {
      const g = game.current;
      if (g.state === 'dead') game.current = newGame(g.best);
      game.current.state = 'playing';
    };

    const onKey = (e: KeyboardEvent) => {
      const g = game.current;
      const k = e.key.toLowerCase();
      const d = DIRS[k];
      if (d) {
        if (g.state === 'ready') start();
        if (game.current.state === 'playing') {
          const queued = game.current.queue.length;
          turn(game.current, d);
          if (game.current.queue.length > queued) sfx('move');
        }
      } else if (k === ' ' || k === 'enter') {
        if (g.state !== 'playing') start();
      } else if (k === 'escape') {
        onCloseRef.current(g.score, g.best);
      } else return;
      e.preventDefault();
    };

    let touch: Cell | null = null;
    const onPointerDown = (e: PointerEvent) => {
      touch = { x: e.clientX, y: e.clientY };
      if (game.current.state !== 'playing') start();
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!touch) return;
      const dx = e.clientX - touch.x;
      const dy = e.clientY - touch.y;
      touch = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      const d = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
      if (game.current.state === 'playing') turn(game.current, d);
    };

    // Sounds: compare the game with how it was last frame.
    const heard = { game: game.current, state: game.current.state, score: game.current.score };
    const sounds = (g: Game) => {
      if (heard.state !== 'playing' && g.state === 'playing') sfx('start');
      if (heard.game === g && g.score > heard.score) sfx('eat');
      if (heard.state === 'playing' && g.state === 'dead') {
        sfx('die');
        if (g.score > 0 && g.score >= g.best) window.setTimeout(() => sfx('best'), 450);
      }
      Object.assign(heard, { game: g, state: g.state, score: g.score });
    };

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const g = game.current;
      if (g.state === 'playing') {
        g.acc += Math.min(250, now - last);
        while (g.acc >= g.tick && g.state === 'playing') {
          g.acc -= g.tick;
          move(g);
        }
      }
      last = now;
      sounds(g);
      draw(ctx, g, now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    canvas.focus();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <div className="tty-window-backdrop">
      <div className="tty-window tty-game" role="dialog" aria-modal="true" aria-label="Snake">
        <div className="tty-window-title">
          <span>C:\OMAI\GAMES\SNAKE.EXE</span>
          <button type="button" onClick={() => onClose(game.current.score, game.current.best)} aria-label="Close">
            [X]
          </button>
        </div>
        <canvas ref={canvasRef} width={W} height={H} tabIndex={-1} />
        <div className="tty-window-nav">
          <span className="tty-dim">WASD · ARROWS · SWIPE</span>
          <span className="tty-dim">SPACE START · ESC QUIT</span>
        </div>
      </div>
    </div>
  );
}
