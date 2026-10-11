import { buildTirth, TIRTH_W, TIRTH_H } from './pixel/tirth.js';
import { GARUDA } from './pixel/garuda.js';
import { toCanvas, fromRows } from './pixel/grid.js';

const shrug = toCanvas(buildTirth({ pose: 'shrug', look: { x: 0, y: -1 } }));
const shrugBlink = toCanvas(buildTirth({ pose: 'shrug', blink: true }));
const bird = { up: toCanvas(GARUDA.up), down: toCanvas(GARUDA.down) };
const question = toCanvas(
  fromRows(['.aaa.', 'a...a', '....a', '...a.', '..a..', '.....', '..a..'], { a: '#ff5a1f' }),
);

// Pixel-Tirth shrugs while the garuda sweeps the sky looking for the missing page.
export function createNotFoundScene(canvas, reducedMotion) {
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let s = 3;

  function layout() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    s = Math.max(1, Math.min(5, Math.floor(Math.min((h * 0.75) / TIRTH_H, (w * 0.8) / TIRTH_W))));
  }

  function render(now) {
    ctx.clearRect(0, 0, w, h);
    const sx = Math.round(w / 2 - (TIRTH_W / 2) * s);
    const sy = Math.round(h - (TIRTH_H + 2) * s);

    const glow = ctx.createRadialGradient(w / 2, sy + 60 * s, 0, w / 2, sy + 60 * s, 70 * s);
    glow.addColorStop(0, 'rgba(255, 90, 31, 0.14)');
    glow.addColorStop(1, 'rgba(255, 90, 31, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const blink = !reducedMotion && now % 3600 < 140;
    const img = blink ? shrugBlink : shrug;
    ctx.drawImage(img, sx, sy, img.width * s, img.height * s);

    const qs = s + 1;
    const qBob = reducedMotion ? 0 : Math.round(Math.sin(now / 400) * s);
    ctx.drawImage(question, sx + 6 * s, sy + 8 * s + qBob, question.width * qs, question.height * qs);
    ctx.drawImage(question, sx + 60 * s, sy + 4 * s - qBob, question.width * qs, question.height * qs);

    const t = reducedMotion ? 1.2 : now / 1800;
    const frame = !reducedMotion && Math.floor(now / 120) % 2 ? bird.down : bird.up;
    const bx = w / 2 + Math.sin(t) * w * 0.34 - (frame.width / 2) * s;
    const by = Math.max(4, sy - 6 * s + Math.sin(t * 2) * 8 * s);
    ctx.drawImage(frame, Math.round(bx), Math.round(by), frame.width * s, frame.height * s);
  }

  function loop(now) {
    render(now);
    requestAnimationFrame(loop);
  }

  new ResizeObserver(() => {
    layout();
    render(performance.now());
  }).observe(canvas);

  layout();
  if (reducedMotion) render(performance.now());
  else requestAnimationFrame(loop);
}
