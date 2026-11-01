import { useEffect, useRef } from 'react';
import { sfx } from '@/components/crt/crt-sound';

const W = 800;
const H = 500;
const FG = '#7dff8a';
const HOT = '#d6ffd9';
const AMBER = '#ffcf5a';

export type ArcadeKind = 'breakout' | 'tetris' | 'invaders';

type Point = { x: number; y: number };
type Brick = Point & { alive: boolean };
type Piece = { shape: Point[]; color: string };

type BreakoutState = {
  kind: 'breakout';
  status: 'ready' | 'playing' | 'won' | 'over';
  paddleX: number;
  ball: Point & { vx: number; vy: number };
  bricks: Brick[];
  score: number;
  lives: number;
};

type InvadersState = {
  kind: 'invaders';
  status: 'ready' | 'playing' | 'won' | 'over';
  playerX: number;
  enemies: Point[];
  enemyDirection: number;
  playerShots: Point[];
  enemyShots: Point[];
  shotCooldown: number;
  enemyCooldown: number;
  score: number;
  lives: number;
};

type TetrisState = {
  kind: 'tetris';
  status: 'ready' | 'playing' | 'over';
  board: (string | null)[][];
  piece: Piece & Point;
  nextPieces: Piece[];
  heldPiece: Piece | null;
  canHold: boolean;
  gravity: number;
  score: number;
  lines: number;
};

type ArcadeState = BreakoutState | InvadersState | TetrisState;

const TETRIS_SHAPES: Piece[] = [
  { shape: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }], color: '#58d8ff' },
  { shape: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#ffcf5a' },
  { shape: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#be8cff' },
  { shape: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], color: '#7dff8a' },
  { shape: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#ff7d9d' },
  { shape: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#ff9b55' },
  { shape: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], color: '#77aaff' },
];

function createState(kind: ArcadeKind): ArcadeState {
  if (kind === 'breakout') {
    const bricks: Brick[] = [];
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 9; col++) bricks.push({ x: 35 + col * 81, y: 62 + row * 25, alive: true });
    return {
      kind,
      status: 'ready',
      paddleX: W / 2,
      ball: { x: W / 2, y: 390, vx: 230, vy: -260 },
      bricks,
      score: 0,
      lives: 3,
    };
  }
  if (kind === 'invaders') {
    const enemies: Point[] = [];
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 8; col++) enemies.push({ x: 190 + col * 56, y: 85 + row * 42 });
    return {
      kind,
      status: 'ready',
      playerX: W / 2,
      enemies,
      enemyDirection: 1,
      playerShots: [],
      enemyShots: [],
      shotCooldown: 0,
      enemyCooldown: 1,
      score: 0,
      lives: 3,
    };
  }
  return {
    kind,
    status: 'ready',
    board: Array.from({ length: 20 }, () => Array<string | null>(10).fill(null)),
    piece: { ...randomPiece(), x: 3, y: 0 },
    nextPieces: Array.from({ length: 4 }, randomPiece),
    heldPiece: null,
    canHold: true,
    gravity: 0,
    score: 0,
    lines: 0,
  };
}

function randomPiece(): Piece {
  const piece = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)];
  return { shape: piece.shape.map((point) => ({ ...point })), color: piece.color };
}

function copyPiece(piece: Piece): Piece {
  return { shape: piece.shape.map((point) => ({ ...point })), color: piece.color };
}

function spawnNextPiece(state: TetrisState) {
  const [next, ...queue] = state.nextPieces;
  state.piece = { ...next, x: 3, y: 0 };
  state.nextPieces = [...queue, randomPiece()];
  state.canHold = true;
  if (collides(state.board, state.piece.shape, state.piece.x, state.piece.y)) state.status = 'over';
}

function holdPiece(state: TetrisState) {
  if (!state.canHold) return;
  const current = copyPiece(state.piece);
  if (state.heldPiece) {
    state.piece = { ...state.heldPiece, x: 3, y: 0 };
    state.heldPiece = current;
    if (collides(state.board, state.piece.shape, state.piece.x, state.piece.y)) state.status = 'over';
  } else {
    state.heldPiece = current;
    spawnNextPiece(state);
  }
  state.canHold = false;
  state.gravity = 0;
}

function start(state: ArcadeState) {
  if (state.status === 'ready') state.status = 'playing';
  else if (state.status === 'over' || state.status === 'won') Object.assign(state, createState(state.kind), { status: 'playing' });
}

function rotate(shape: Point[]): Point[] {
  return shape.map(({ x, y }) => ({ x: 3 - y, y: x }));
}

function collides(board: (string | null)[][], shape: Point[], x: number, y: number) {
  return shape.some((point) => {
    const bx = x + point.x;
    const by = y + point.y;
    return bx < 0 || bx >= 10 || by >= 20 || (by >= 0 && board[by][bx] !== null);
  });
}

function lockPiece(state: TetrisState) {
  for (const point of state.piece.shape) {
    const x = state.piece.x + point.x;
    const y = state.piece.y + point.y;
    if (y < 0) {
      state.status = 'over';
      return;
    }
    state.board[y][x] = state.piece.color;
  }
  const remaining = state.board.filter((row) => row.some((cell) => cell === null));
  const cleared = 20 - remaining.length;
  if (cleared) {
    state.score += [0, 100, 300, 500, 800][cleared];
    state.lines += cleared;
    while (remaining.length < 20) remaining.unshift(Array<string | null>(10).fill(null));
  }
  state.board = remaining;
  spawnNextPiece(state);
}

/* ── Sounds ─────────────────────────────────────────────────────────────
 * Worked out by comparing the game with how it was a moment ago, so the
 * game logic above doesn't need to know about audio.
 */

type Heard = {
  status: ArcadeState['status'];
  score: number;
  lives: number;
  vx: number;
  vy: number;
  shots: number;
  enemies: number;
  lines: number;
  piece: unknown;
};

function look(s: ArcadeState): Heard {
  return {
    status: s.status,
    score: s.score,
    lives: s.kind === 'tetris' ? 0 : s.lives,
    vx: s.kind === 'breakout' ? s.ball.vx : 0,
    vy: s.kind === 'breakout' ? s.ball.vy : 0,
    shots: s.kind === 'invaders' ? s.playerShots.length : 0,
    enemies: s.kind === 'invaders' ? s.enemies.length : 0,
    lines: s.kind === 'tetris' ? s.lines : 0,
    piece: s.kind === 'tetris' ? s.piece : null,
  };
}

/** The four descending notes of the invaders' march. */
const MARCH = [1, 0.891, 0.794, 0.75];

function playChanges(s: ArcadeState, was: Heard) {
  const now = look(s);
  if (was.status !== 'playing') {
    if (now.status === 'playing') sfx('start');
    return;
  }
  if (s.kind === 'breakout') {
    if (now.lives < was.lives) sfx(now.status === 'over' ? 'lose' : 'life');
    else if (now.score > was.score) {
      // Higher rows ring higher.
      const row = Math.max(0, Math.min(4, Math.round((s.ball.y - 62) / 25)));
      sfx('brick', { rate: 1 + (4 - row) * 0.12 });
    } else if (Math.sign(now.vy) !== Math.sign(was.vy)) sfx(s.ball.y > H - 80 ? 'paddle' : 'wall');
    else if (Math.sign(now.vx) !== Math.sign(was.vx)) sfx('wall');
  }
  if (s.kind === 'invaders') {
    if (now.shots > was.shots) sfx('shoot');
    if (now.enemies < was.enemies) sfx('boom');
    if (now.lives < was.lives) sfx('hit');
    if (now.status === 'over') sfx('lose');
  }
  if (s.kind === 'tetris') {
    const cleared = now.lines - was.lines;
    if (cleared > 0) sfx(cleared >= 4 ? 'tetris' : 'clear');
    else if (now.piece !== was.piece) sfx('lock');
    if (now.status === 'over') sfx('lose');
  }
  if (now.status === 'won') sfx('win');
}

function updateBreakout(state: BreakoutState, keys: Set<string>, dt: number) {
  if (keys.has('arrowleft') || keys.has('a')) state.paddleX -= 460 * dt;
  if (keys.has('arrowright') || keys.has('d')) state.paddleX += 460 * dt;
  state.paddleX = Math.max(50, Math.min(W - 50, state.paddleX));
  state.ball.x += state.ball.vx * dt;
  state.ball.y += state.ball.vy * dt;
  if (state.ball.x < 8 || state.ball.x > W - 8) state.ball.vx *= -1;
  if (state.ball.y < 8) state.ball.vy = Math.abs(state.ball.vy);
  if (state.ball.y > H - 34 && state.ball.y < H - 18 && state.ball.vy > 0 &&
      Math.abs(state.ball.x - state.paddleX) < 58) {
    state.ball.vy = -Math.abs(state.ball.vy);
    state.ball.vx += ((state.ball.x - state.paddleX) / 58) * 100;
  }
  for (const brick of state.bricks) {
    if (!brick.alive || state.ball.x < brick.x || state.ball.x > brick.x + 70 ||
        state.ball.y < brick.y || state.ball.y > brick.y + 16) continue;
    brick.alive = false;
    state.ball.vy *= -1;
    state.score += 10;
    if (state.bricks.every((item) => !item.alive)) state.status = 'won';
    break;
  }
  if (state.ball.y > H) {
    state.lives--;
    if (state.lives <= 0) state.status = 'over';
    else state.ball = { x: W / 2, y: 390, vx: 230 * (Math.random() < 0.5 ? -1 : 1), vy: -260 };
  }
}

function updateInvaders(state: InvadersState, keys: Set<string>, dt: number) {
  if (keys.has('arrowleft') || keys.has('a')) state.playerX -= 340 * dt;
  if (keys.has('arrowright') || keys.has('d')) state.playerX += 340 * dt;
  state.playerX = Math.max(24, Math.min(W - 24, state.playerX));
  state.shotCooldown -= dt;
  state.enemyCooldown -= dt;
  if (keys.has(' ') && state.shotCooldown <= 0) {
    state.playerShots.push({ x: state.playerX, y: 440 });
    state.shotCooldown = 0.28;
  }
  if (state.enemyCooldown <= 0 && state.enemies.length) {
    const shooter = state.enemies[Math.floor(Math.random() * state.enemies.length)];
    state.enemyShots.push({ x: shooter.x + 12, y: shooter.y + 15 });
    state.enemyCooldown = 0.65 + Math.random() * 0.55;
  }

  const speed = 28 + (24 - state.enemies.length) * 2.5;
  const edge = state.enemies.some((enemy) => enemy.x < 20 || enemy.x > W - 40);
  if (edge) {
    state.enemyDirection *= -1;
    state.enemies.forEach((enemy) => { enemy.y += 14; });
  }
  state.enemies.forEach((enemy) => { enemy.x += state.enemyDirection * speed * dt; });
  state.playerShots.forEach((shot) => { shot.y -= 440 * dt; });
  state.enemyShots.forEach((shot) => { shot.y += 220 * dt; });

  for (let i = state.playerShots.length - 1; i >= 0; i--) {
    const shot = state.playerShots[i];
    const hit = state.enemies.findIndex((enemy) =>
      shot.x >= enemy.x - 3 && shot.x <= enemy.x + 25 && shot.y >= enemy.y && shot.y <= enemy.y + 20);
    if (hit >= 0) {
      state.enemies.splice(hit, 1);
      state.playerShots.splice(i, 1);
      state.score += 10;
    }
  }
  state.playerShots = state.playerShots.filter((shot) => shot.y > 0);
  for (let i = state.enemyShots.length - 1; i >= 0; i--) {
    const shot = state.enemyShots[i];
    if (shot.y >= 435 && shot.y <= 465 && Math.abs(shot.x - state.playerX) < 24) {
      state.enemyShots.splice(i, 1);
      state.lives--;
      if (state.lives <= 0) state.status = 'over';
    }
  }
  state.enemyShots = state.enemyShots.filter((shot) => shot.y < H);
  if (state.enemies.some((enemy) => enemy.y >= 420)) state.status = 'over';
  if (!state.enemies.length) state.status = 'won';
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#020703';
  ctx.fillRect(0, 0, W, H);
  ctx.shadowColor = 'rgb(125 255 138 / 60%)';
  ctx.shadowBlur = 8;
}

function drawBreakout(ctx: CanvasRenderingContext2D, state: BreakoutState, now: number) {
  state.bricks.forEach((brick, index) => {
    if (!brick.alive) return;
    ctx.fillStyle = ['#7dff8a', '#58d8ff', '#be8cff', '#ffcf5a', '#ff7d9d'][Math.floor(index / 9)];
    ctx.fillRect(brick.x, brick.y, 70, 16);
  });
  ctx.fillStyle = HOT;
  ctx.fillRect(state.paddleX - 48, H - 28, 96, 10);
  ctx.fillStyle = AMBER;
  ctx.fillRect(state.ball.x - 6, state.ball.y - 6, 12, 12);
  drawStats(ctx, `SCORE ${state.score}`, `LIVES ${state.lives}`);
  drawStatus(ctx, state.status, 'SPACE: START / AGAIN   ESC: QUIT', now);
}

function drawInvaders(ctx: CanvasRenderingContext2D, state: InvadersState, now: number) {
  ctx.fillStyle = HOT;
  ctx.fillRect(state.playerX - 16, 440, 32, 18);
  ctx.fillStyle = '#ffcf5a';
  state.enemies.forEach((enemy) => ctx.fillRect(enemy.x, enemy.y, 24, 16));
  ctx.fillStyle = HOT;
  state.playerShots.forEach((shot) => ctx.fillRect(shot.x - 2, shot.y, 4, 12));
  ctx.fillStyle = '#ff7d9d';
  state.enemyShots.forEach((shot) => ctx.fillRect(shot.x - 2, shot.y, 4, 12));
  drawStats(ctx, `SCORE ${state.score}`, `LIVES ${state.lives}`);
  drawStatus(ctx, state.status, '←/→ MOVE   SPACE: FIRE   ESC: QUIT', now);
}

function drawTetris(ctx: CanvasRenderingContext2D, state: TetrisState, now: number) {
  const cell = 22;
  const left = (W - cell * 10) / 2;
  const top = 26;
  ctx.strokeStyle = '#1f5a29';
  ctx.lineWidth = 2;
  ctx.strokeRect(left, top, cell * 10, cell * 20);
  state.board.forEach((row, y) => row.forEach((color, x) => {
    if (!color) return;
    ctx.fillStyle = color;
    ctx.fillRect(left + x * cell + 1, top + y * cell + 1, cell - 2, cell - 2);
  }));
  state.piece.shape.forEach(({ x, y }) => {
    ctx.fillStyle = state.piece.color;
    ctx.fillRect(left + (state.piece.x + x) * cell + 1, top + (state.piece.y + y) * cell + 1, cell - 2, cell - 2);
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = HOT;
  ctx.font = '32px VT323, monospace';
  ctx.fillText(`SCORE ${state.score}`, 28, 230);
  ctx.fillText(`LINES ${state.lines}`, 28, 270);
  drawPiecePreview(ctx, state.heldPiece, 145, 52, state.canHold ? 'HOLD' : 'HOLD USED');
  state.nextPieces.slice(0, 3).forEach((piece, index) => {
    drawPiecePreview(ctx, piece, 655, 35 + index * 135, `NEXT ${index + 1}`);
  });
  drawStatus(ctx, state.status, '←/→ MOVE   ↑ ROTATE   ↓ DROP   SPACE: HARD DROP   C: HOLD', now);
}

function drawPiecePreview(ctx: CanvasRenderingContext2D, piece: Piece | null, centerX: number, top: number, label: string) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = FG;
  ctx.font = '24px VT323, monospace';
  if (label) ctx.fillText(label, centerX, top);
  if (!piece) return;

  const cell = 18;
  const minX = Math.min(...piece.shape.map(({ x }) => x));
  const maxX = Math.max(...piece.shape.map(({ x }) => x));
  const minY = Math.min(...piece.shape.map(({ y }) => y));
  const maxY = Math.max(...piece.shape.map(({ y }) => y));
  const width = (maxX - minX + 1) * cell;
  const height = (maxY - minY + 1) * cell;
  const left = centerX - width / 2;
  const startY = top + 32 + Math.max(0, (62 - height) / 2);
  piece.shape.forEach(({ x, y }) => {
    ctx.fillStyle = piece.color;
    ctx.fillRect(left + (x - minX) * cell + 1, startY + (y - minY) * cell + 1, cell - 2, cell - 2);
  });
}

function drawStats(ctx: CanvasRenderingContext2D, left: string, right: string) {
  ctx.fillStyle = HOT;
  ctx.font = '28px VT323, monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(left, 16, 12);
  ctx.textAlign = 'right';
  ctx.fillText(right, W - 16, 12);
}

function drawStatus(ctx: CanvasRenderingContext2D, status: ArcadeState['status'], controls: string, now: number) {
  if (status === 'playing') return;
  ctx.fillStyle = 'rgb(2 7 3 / 82%)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '40px VT323, monospace';
  ctx.fillStyle = status === 'won' ? HOT : status === 'over' ? AMBER : HOT;
  ctx.fillText(status === 'ready' ? 'READY?' : status === 'won' ? 'YOU WIN!' : 'GAME OVER', W / 2, H / 2 - 22);
  ctx.fillStyle = FG;
  ctx.font = '26px VT323, monospace';
  ctx.fillText(status === 'ready' ? 'PRESS SPACE TO START' : 'SPACE: PLAY AGAIN', W / 2, H / 2 + 20);
  ctx.fillStyle = '#3f9e4c';
  ctx.font = '20px VT323, monospace';
  ctx.fillText(controls, W / 2, H - 20);
  void now;
}

/* ── Touch controls ─────────────────────────────────────────────────────
 * Phones have no arrow keys, so these buttons press the same keys the
 * keyboard would (held buttons stay held; Tetris moves repeat while held).
 */

const TOUCH =
  typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches;

type PadButton = { label: string; key: string; repeat?: boolean; wide?: boolean };

const PADS: Partial<Record<ArcadeKind, PadButton[]>> = {
  tetris: [
    { label: '◀', key: 'ArrowLeft', repeat: true },
    { label: '▶', key: 'ArrowRight', repeat: true },
    { label: '↻', key: 'ArrowUp' },
    { label: '▼', key: 'ArrowDown', repeat: true },
    { label: 'DROP', key: ' ', wide: true },
    { label: 'HOLD', key: 'c', wide: true },
  ],
  invaders: [
    { label: '◀', key: 'ArrowLeft' },
    { label: '▶', key: 'ArrowRight' },
    { label: 'FIRE', key: ' ', wide: true },
  ],
};

const press = (key: string, type: 'keydown' | 'keyup', repeat = false) =>
  window.dispatchEvent(new KeyboardEvent(type, { key, repeat, bubbles: true }));

function TouchPad({ buttons }: { buttons: PadButton[] }) {
  return (
    <div className="tty-pad">
      {buttons.map((b) => (
        <PadKey key={b.label} button={b} />
      ))}
    </div>
  );
}

function PadKey({ button }: { button: PadButton }) {
  const timers = useRef<number[]>([]);
  const held = useRef(false);
  const release = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current.forEach((t) => window.clearInterval(t));
    timers.current = [];
    if (held.current) press(button.key, 'keyup');
    held.current = false;
  };
  useEffect(() => release, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <button
      type="button"
      className={`tty-pad-key${button.wide ? ' tty-pad-wide' : ''}`}
      aria-label={button.label === '↻' ? 'Rotate' : button.label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        held.current = true;
        press(button.key, 'keydown');
        if (button.repeat) {
          timers.current.push(
            window.setTimeout(() => {
              timers.current.push(window.setInterval(() => press(button.key, 'keydown', true), 90));
            }, 260),
          );
        }
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {button.label}
    </button>
  );
}

export function Arcade({ kind, onClose }: { kind: ArcadeKind; onClose: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<ArcadeState>(createState(kind));
  const keysRef = useRef(new Set<string>());
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let heard = look(stateRef.current);
    let marchClock = 0;
    let marchStep = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const state = stateRef.current;
      // Tetris moves happen right here, so their sounds do too.
      const before =
        state.kind === 'tetris' && state.status === 'playing'
          ? { piece: state.piece, x: state.piece.x, y: state.piece.y, shape: state.piece.shape, held: state.heldPiece, lines: state.lines }
          : null;
      if (key === 'escape') {
        onCloseRef.current(state.score);
      } else if (key === ' ' || key === 'enter') {
        if (state.kind === 'tetris' && state.status === 'playing' && key === ' ') {
          while (!collides(state.board, state.piece.shape, state.piece.x, state.piece.y + 1)) state.piece.y++;
          lockPiece(state);
        } else if (state.kind !== 'tetris' || state.status !== 'playing') {
          start(state);
        }
      } else if (state.kind === 'tetris' && state.status === 'playing' && (key === 'c' || key === 'shift')) {
        if (!event.repeat) holdPiece(state);
      } else if (state.kind === 'tetris' && state.status === 'playing') {
        if (key === 'arrowleft' && !collides(state.board, state.piece.shape, state.piece.x - 1, state.piece.y)) state.piece.x--;
        if (key === 'arrowright' && !collides(state.board, state.piece.shape, state.piece.x + 1, state.piece.y)) state.piece.x++;
        if (key === 'arrowup' || key === 'x') {
          const shape = rotate(state.piece.shape);
          if (!collides(state.board, shape, state.piece.x, state.piece.y)) state.piece.shape = shape;
        }
        if (key === 'arrowdown' && !collides(state.board, state.piece.shape, state.piece.x, state.piece.y + 1)) {
          state.piece.y++;
          state.score += 1;
        }
      }
      if (before && state.kind === 'tetris') {
        const cleared = state.lines - before.lines;
        if (key === ' ' && state.piece !== before.piece) sfx('hardDrop');
        if (cleared > 0) sfx(cleared >= 4 ? 'tetris' : 'clear');
        else if (state.heldPiece !== before.held) sfx('hold');
        else if (state.piece !== before.piece) {
          if (key !== ' ') sfx('lock');
        } else if (state.piece.shape !== before.shape) sfx('rotate');
        else if (state.piece.x !== before.x) sfx('move');
        else if (state.piece.y !== before.y) sfx('softDrop');
        if (state.status === 'over') sfx('lose');
        heard = look(state);
      }
      keysRef.current.add(key);
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(key)) event.preventDefault();
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.key.toLowerCase());
    const onBlur = () => keysRef.current.clear();
    const onPointerMove = (event: PointerEvent) => {
      const state = stateRef.current;
      if (state.kind !== 'breakout') return;
      const bounds = canvas.getBoundingClientRect();
      state.paddleX = ((event.clientX - bounds.left) / bounds.width) * W;
    };
    const onPointerDown = () => {
      if (stateRef.current.status !== 'playing') start(stateRef.current);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const state = stateRef.current;
      if (state.status === 'playing') {
        if (state.kind === 'breakout') updateBreakout(state, keysRef.current, dt);
        if (state.kind === 'invaders') updateInvaders(state, keysRef.current, dt);
        if (state.kind === 'tetris') {
          state.gravity += dt;
          if (state.gravity >= 0.65) {
            state.gravity = 0;
            if (collides(state.board, state.piece.shape, state.piece.x, state.piece.y + 1)) lockPiece(state);
            else state.piece.y++;
          }
        }
      }
      playChanges(state, heard);
      heard = look(state);
      // The invaders' four-note march speeds up as they thin out.
      if (state.kind === 'invaders' && state.status === 'playing') {
        marchClock -= dt;
        if (marchClock <= 0) {
          sfx('march', { rate: MARCH[marchStep++ % MARCH.length] });
          marchClock = 0.15 + 0.75 * (state.enemies.length / 24);
        }
      }
      drawBackground(ctx);
      if (state.kind === 'breakout') drawBreakout(ctx, state, now);
      if (state.kind === 'invaders') drawInvaders(ctx, state, now);
      if (state.kind === 'tetris') drawTetris(ctx, state, now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    canvas.focus();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  const titles: Record<ArcadeKind, string> = {
    breakout: 'BREAKOUT.EXE',
    tetris: 'TETRIS.EXE',
    invaders: 'INVADERS.EXE',
  };
  const controls: Record<ArcadeKind, string> = {
    breakout: '←/→ OR MOUSE   SPACE: START   ESC: QUIT',
    tetris: '←/→ MOVE   ↑ ROTATE   ↓ DROP   SPACE: HARD DROP   C: HOLD',
    invaders: '←/→ MOVE   SPACE: FIRE   ESC: QUIT',
  };

  return (
    <div className="tty-window-backdrop">
      <div className="tty-window tty-game" role="dialog" aria-modal="true" aria-label={titles[kind]}>
        <div className="tty-window-title">
          <span>{`C:\\OMAI\\GAMES\\${titles[kind]}`}</span>
          <button type="button" onClick={() => onCloseRef.current(stateRef.current.score)} aria-label="Close">[X]</button>
        </div>
        <canvas ref={canvasRef} width={W} height={H} tabIndex={-1} />
        {TOUCH && PADS[kind] && <TouchPad buttons={PADS[kind]} />}
        <div className="tty-window-nav">
          <span className="tty-dim">{controls[kind]}</span>
          <span className="tty-dim">ESC QUIT</span>
        </div>
      </div>
    </div>
  );
}
