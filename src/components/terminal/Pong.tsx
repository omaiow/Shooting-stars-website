import { useEffect, useRef } from 'react';
import { sfx } from '@/components/crt/crt-sound';

/**
 * Pong — secret program (type PONG). You're the left paddle; the CPU plays at
 * AI_LEVEL on a 1-10 scale. First to WIN_SCORE. W/S, arrows or the mouse to
 * move, SPACE to serve, ESC to quit.
 */

const W = 800;
const H = 500;
const PADDLE_W = 12;
const PADDLE_H = 80;
const PADDLE_X = 24;
const BALL = 10;
const PLAYER_SPEED = 460; // px/s
const SERVE_SPEED = 360;
const MAX_BALL_SPEED = 900;
const SPEEDUP = 1.05;
const MAX_BOUNCE = (55 * Math.PI) / 180;
const WIN_SCORE = 7;
const LOSS_JOKE_DURATION = 4500;

const AI_LEVEL = 4;
const LOSS_JOKE_ART = `
                                                                        ████████
                                                                    ███▒▒▒▒▒▒▒▒▒▒▒▒███
                                                                 ██▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒███
                                                 ░▓███████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒███████
                                                █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒███
                                                █▒▒▒▒███▒▒▒▒▒▒▒▒▒▒▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
                                                ▒██▒▒▒▒▒▒▒██████▒▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
                                                  █▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█
                                                   ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒█████████████████████▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓█
                                                     ███▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒▒▒▒▒█
                                                       ███▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒███▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▓▒▒▒██
                              ███████████████████████████████████████████████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██  ███▒▒▒▒▒▒▒▒▒██
                                          █████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█  ██▒▒▒▒▒████▒▒▒██
                                                        ██████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█████▓███
                                                           █▒▒▒▒▒▒▒▒▒▒▒█████████▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒▒▒████
                                                          █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██████████▒▒▒▒▒▒▒▒▒▒▒█▓▒▒▒▒▒██████▒▒▓▒██
                                                          █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▒▒▒█
                                                          █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒█▓▒▒██
                                                         █▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓███▓▒▒▒▒▒▒▒▒▒▓█▒▒▒█▒▒▒▒████▒█
                                                         █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒▒▒█▓▒▒▒▒▒▒█████
                                                         ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██ █▒▒▒▓▓▓█▓███▓▒▒▒▒▒▒▒█
                                                          █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒███    █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
                                                          █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒██     ████▒▒▒▒▒▒▒▒▒██
                                                          ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒█       █  ██████
                                                           █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒█       █   ███
                                                           █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒███▒▒▒██    ██ ██ ██
                                                           ██▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████▒▒▒█   ██████
                                                            █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒▒▒█▒▒▒▒▒▒▒▒▒▒█  █▒▒█ █   █
                                                            ▒█▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██████▒▒█▒▒▒▒▒▒▒▒▒██ ██▒██ ██ █ █
                                                             ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒████▒▒▒▒▒▒▒▒███  █▓  ████
                                                              █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████▒▒▒▒▒▒▓▒▒█▒███████
                                                               █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▒▒█  █▓▒▒▒▒▒▒▒▒██▒▒▒▒▒▒▒██
                                                                ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒███     █▒▒▒▒▒▒▒▒▒▒▒▒▒██
                                                                  █▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█      ██▒▒▒▒▒▒▒▒▒▒▒██
                                                                   ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒█           ████████
                                                                     ████▒▒▒▒▒▒▒▒▒▒▒██
                                                                         ▒█▒▒▒▒▒▒▒▒▒▒█
                                                                            ██▒▒▒▒▒▒▒▒█
                                                                               ██▒▒▒▒▒▒█
                                                                                  ███▒▒▒█
                                                                                      █████
                                                                                          ██
`.split('\n').filter((line) => line.trim().length > 0);

/**
 * Difficulty from level 1-10: how fast the CPU paddle moves, how often it
 * re-reads the ball, and how far off its aim is on each volley.
 * Level 4 ≈ keeps up with slow rallies, loses fast angled shots.
 */
function aiTuning(level: number) {
  const t = (level - 1) / 9;
  return {
    speed: 180 + t * 320, // px/s — level 4: 287
    reactionMs: 320 - t * 280, // level 4: 227ms
    aimError: 70 - t * 65, // ±px — level 4: ±48
  };
}

const AI = aiTuning(AI_LEVEL);

type Game = {
  playerY: number;
  cpuY: number;
  ball: { x: number; y: number; vx: number; vy: number };
  score: [number, number];
  serving: boolean;
  serveDir: 1 | -1;
  winner: 'YOU' | 'CPU' | null;
  lossJokeAt: number | null;
  aiTarget: number;
  aiError: number;
  aiNextThink: number;
  keys: { up: boolean; down: boolean };
  mouseY: number | null;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function newGame(): Game {
  return {
    playerY: H / 2,
    cpuY: H / 2,
    ball: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
    score: [0, 0],
    serving: true,
    serveDir: Math.random() < 0.5 ? 1 : -1,
    winner: null,
    lossJokeAt: null,
    aiTarget: H / 2,
    aiError: 0,
    aiNextThink: 0,
    keys: { up: false, down: false },
    mouseY: null,
  };
}

function newLossJoke(): Game {
  const game = newGame();
  game.winner = 'CPU';
  game.lossJokeAt = performance.now();
  return game;
}

function serve(g: Game) {
  const angle = (Math.random() - 0.5) * (Math.PI / 3);
  g.ball = {
    x: W / 2,
    y: H / 2,
    vx: Math.cos(angle) * SERVE_SPEED * g.serveDir,
    vy: Math.sin(angle) * SERVE_SPEED,
  };
  g.aiError = (Math.random() * 2 - 1) * AI.aimError;
  g.serving = false;
}

/** Where the ball will cross x, folding in bounces off the top and bottom walls. */
function predictY(b: Game['ball'], x: number) {
  const t = (x - b.x) / b.vx;
  const lo = BALL / 2;
  const span = H - BALL;
  const raw = b.y + b.vy * t - lo;
  const m = ((raw % (2 * span)) + 2 * span) % (2 * span);
  return lo + (m < span ? m : 2 * span - m);
}

/** Returns true if the ball hit this paddle and was sent back. */
function bounceOff(g: Game, paddleY: number, side: -1 | 1) {
  const b = g.ball;
  const faceX = side === -1 ? PADDLE_X + PADDLE_W : W - PADDLE_X - PADDLE_W;
  const movingIn = side === -1 ? b.vx < 0 : b.vx > 0;
  const reached = side === -1 ? b.x - BALL / 2 <= faceX : b.x + BALL / 2 >= faceX;
  const behind = side === -1 ? b.x < PADDLE_X : b.x > W - PADDLE_X;
  if (!movingIn || !reached || behind) return false;
  const offset = (b.y - paddleY) / (PADDLE_H / 2 + BALL / 2);
  if (Math.abs(offset) > 1) return false;
  const speed = Math.min(MAX_BALL_SPEED, Math.hypot(b.vx, b.vy) * SPEEDUP);
  const angle = offset * MAX_BOUNCE;
  b.vx = Math.cos(angle) * speed * -side;
  b.vy = Math.sin(angle) * speed;
  b.x = faceX - (side * BALL) / 2;
  return true;
}

function step(g: Game, dt: number, now: number) {
  // Player
  if (g.mouseY != null) {
    const d = g.mouseY - g.playerY;
    g.playerY += clamp(d, -PLAYER_SPEED * 1.6 * dt, PLAYER_SPEED * 1.6 * dt);
  }
  if (g.keys.up) g.playerY -= PLAYER_SPEED * dt;
  if (g.keys.down) g.playerY += PLAYER_SPEED * dt;
  g.playerY = clamp(g.playerY, PADDLE_H / 2, H - PADDLE_H / 2);

  // CPU: re-reads the ball every reactionMs, aims a little off, drifts home when the ball leaves
  if (now >= g.aiNextThink) {
    g.aiNextThink = now + AI.reactionMs;
    const b = g.ball;
    g.aiTarget = !g.serving && b.vx > 0 ? predictY(b, W - PADDLE_X - PADDLE_W) + g.aiError : H / 2;
  }
  const d = g.aiTarget - g.cpuY;
  if (Math.abs(d) > 4) g.cpuY += clamp(d, -AI.speed * dt, AI.speed * dt);
  g.cpuY = clamp(g.cpuY, PADDLE_H / 2, H - PADDLE_H / 2);

  if (g.serving || g.winner) return;

  const b = g.ball;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  if (b.y < BALL / 2) {
    b.y = BALL / 2;
    b.vy = Math.abs(b.vy);
  } else if (b.y > H - BALL / 2) {
    b.y = H - BALL / 2;
    b.vy = -Math.abs(b.vy);
  }

  if (bounceOff(g, g.playerY, -1)) g.aiError = (Math.random() * 2 - 1) * AI.aimError;
  bounceOff(g, g.cpuY, 1);

  if (b.x < -BALL || b.x > W + BALL) {
    const cpuScored = b.x < 0;
    g.score[cpuScored ? 1 : 0]++;
    g.serveDir = cpuScored ? -1 : 1;
    g.serving = true;
    g.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    if (g.score[0] >= WIN_SCORE) g.winner = 'YOU';
    else if (g.score[1] >= WIN_SCORE) {
      g.winner = 'CPU';
      g.lossJokeAt = now;
    }
  }
}

function drawLossJoke(ctx: CanvasRenderingContext2D, now: number, startedAt: number) {
  const progress = clamp((now - startedAt) / LOSS_JOKE_DURATION, 0, 1);
  ctx.fillStyle = 'rgb(2 7 3 / 94%)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgb(125 255 138 / 60%)';
  ctx.shadowBlur = 10;
  const artIndent = Math.min(...LOSS_JOKE_ART.map((line) => line.length - line.trimStart().length));
  const art = LOSS_JOKE_ART.map((line) => line.slice(artIndent).trimEnd());
  const artFontSize = Math.min(7, (W - 32) / Math.max(...art.map((line) => line.length)), 190 / art.length);
  const artHeight = art.length * artFontSize;
  ctx.fillStyle = '#0db3d3';
  ctx.font = `${artFontSize}px monospace`;
  ctx.textAlign = 'left';
  const visibleBounds = art.map((line) => {
    const first = line.search(/\S/);
    const last = line.trimEnd().length - 1;
    return {
      left: ctx.measureText(line.slice(0, first)).width,
      right: ctx.measureText(line.slice(0, last + 1)).width,
    };
  });
  const artLeft = Math.min(...visibleBounds.map(({ left }) => left));
  const artRight = Math.max(...visibleBounds.map(({ right }) => right));
  const artX = (W - (artRight - artLeft)) / 2 - artLeft;
  art.forEach((line, index) => {
    ctx.fillText(line, artX, 35 + index * (artHeight / art.length));
  });

  ctx.shadowColor = 'rgb(125 255 138 / 45%)';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#d6ffd9';
  ctx.font = '32px VT323, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Taking control of account to send messages', W / 2, 275);

  const barWidth = 42;
  const filled = Math.floor(progress * barWidth);
  const bar = `[${'#'.repeat(filled)}${'-'.repeat(barWidth - filled)}]`;
  ctx.font = '28px VT323, monospace';
  ctx.fillStyle = '#7dff8a';
  ctx.fillText(bar, W / 2, 325);

  if (progress === 1) {
    ctx.fillStyle = '#ffcf5a';
    ctx.font = '42px VT323, monospace';
    ctx.fillText('JUST KIDDING!', W / 2, 390);
  }
}

function draw(ctx: CanvasRenderingContext2D, g: Game, now: number) {
  const fg = '#7dff8a';
  const hot = '#d6ffd9';
  const dim = '#1f5a29';
  ctx.fillStyle = '#020703';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = dim;
  for (let y = 8; y < H; y += 28) ctx.fillRect(W / 2 - 2, y, 4, 14);

  ctx.shadowColor = 'rgb(125 255 138 / 60%)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = fg;
  ctx.font = '72px VT323, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(String(g.score[0]), W / 2 - 80, 18);
  ctx.fillText(String(g.score[1]), W / 2 + 80, 18);

  ctx.fillRect(PADDLE_X, g.playerY - PADDLE_H / 2, PADDLE_W, PADDLE_H);
  ctx.fillRect(W - PADDLE_X - PADDLE_W, g.cpuY - PADDLE_H / 2, PADDLE_W, PADDLE_H);

  ctx.fillStyle = hot;
  if (!g.serving) ctx.fillRect(g.ball.x - BALL / 2, g.ball.y - BALL / 2, BALL, BALL);

  if (g.serving) {
    ctx.font = '32px VT323, monospace';
    ctx.textBaseline = 'middle';
    if (g.winner) {
      ctx.fillStyle = g.winner === 'YOU' ? hot : '#ffcf5a';
      ctx.fillText(g.winner === 'YOU' ? 'YOU WIN.' : 'CPU WINS.', W / 2, H / 2 - 22);
      ctx.fillStyle = fg;
      ctx.fillText('SPACE: PLAY AGAIN   ESC: QUIT', W / 2, H / 2 + 22);
    } else {
      ctx.fillText('PRESS SPACE TO SERVE', W / 2, H / 2);
    }
  }
  if (g.winner === 'CPU' && g.lossJokeAt != null) {
    drawLossJoke(ctx, now, g.lossJokeAt);
  }
  ctx.shadowBlur = 0;
}

export function Pong({
  onClose,
  startWithLossJoke = false,
}: {
  onClose: (score: [number, number]) => void;
  startWithLossJoke?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game>(startWithLossJoke ? newLossJoke() : newGame());
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pressServe = () => {
      const g = game.current;
      if (startWithLossJoke) return;
      if (g.winner === 'CPU' && g.lossJokeAt != null && performance.now() - g.lossJokeAt < LOSS_JOKE_DURATION) return;
      if (g.winner) game.current = newGame();
      else if (g.serving) serve(g);
    };

    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      const g = game.current;
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w' || k === 'arrowdown' || k === 's') {
        g.keys[k === 'arrowup' || k === 'w' ? 'up' : 'down'] = down;
        g.mouseY = null; // keys take over from the mouse
      } else if (down && (k === ' ' || k === 'enter')) pressServe();
      else if (down && k === 'escape') onCloseRef.current([...g.score]);
      else return;
      e.preventDefault();
    };
    const keyDown = onKey(true);
    const keyUp = onKey(false);

    const toGameY = (clientY: number) => {
      const r = canvas.getBoundingClientRect();
      return ((clientY - r.top) / r.height) * H;
    };
    const onPointerMove = (e: PointerEvent) => {
      game.current.mouseY = toGameY(e.clientY);
    };
    const onPointerDown = (e: PointerEvent) => {
      game.current.mouseY = toGameY(e.clientY);
      pressServe();
    };

    // Sounds: compare the game with how it was last frame.
    const heard = {
      game: game.current,
      vx: 0,
      vy: 0,
      points: 0,
      serving: true,
      joke: null as number | null,
      tada: false,
    };
    const sounds = (g: Game, now: number) => {
      const points = g.score[0] + g.score[1];
      if (heard.game === g) {
        if (heard.serving && !g.serving) sfx('start');
        else if (!g.serving && Math.sign(g.ball.vx) !== Math.sign(heard.vx)) sfx('paddle');
        else if (!g.serving && Math.sign(g.ball.vy) !== Math.sign(heard.vy)) sfx('wall');
        // A CPU win gets the modem joke instead of a jingle.
        if (points > heard.points && g.winner !== 'CPU') sfx(g.winner === 'YOU' ? 'win' : 'point');
      }
      if (g.lossJokeAt != null && g.lossJokeAt !== heard.joke) {
        sfx('modem');
        heard.tada = false;
      }
      heard.joke = g.lossJokeAt;
      if (g.lossJokeAt != null && !heard.tada && now - g.lossJokeAt >= LOSS_JOKE_DURATION) {
        sfx('tada');
        heard.tada = true;
      }
      Object.assign(heard, { game: g, vx: g.ball.vx, vy: g.ball.vy, points, serving: g.serving });
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(game.current, dt, now);
      sounds(game.current, now);
      draw(ctx, game.current, now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    canvas.focus();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
    };
  }, [startWithLossJoke]);

  return (
    <div className="tty-window-backdrop">
      <div className="tty-window tty-game" role="dialog" aria-modal="true" aria-label="Pong">
        <div className="tty-window-title">
          <span>{startWithLossJoke ? 'C:\\OMAI\\BEAST.EXE' : `C:\\OMAI\\GAMES\\PONG.EXE — CPU LEVEL ${AI_LEVEL}`}</span>
          <button
            type="button"
            onClick={() => onClose([...game.current.score])}
            aria-label="Close"
          >
            [X]
          </button>
        </div>
        <canvas ref={canvasRef} width={W} height={H} tabIndex={-1} />
        <div className="tty-window-nav">
          <span className="tty-dim">W/S · ↑/↓ · MOUSE</span>
          <span className="tty-dim">SPACE SERVE · FIRST TO {WIN_SCORE} · ESC QUIT</span>
        </div>
      </div>
    </div>
  );
}
