// Background dot grid that bends away from the pointer, plus a dot-and-ring cursor.
// Dots near the pointer are pushed outward and lit orange; they spring back when it leaves.

const SPACING = 48;
const RADIUS = 180;
const PUSH = 26;
const SPRING = 0.12;
const DAMPING = 0.78;
const RING_EASE = 0.2;

const DIM = [70, 70, 76];
const ACCENT = [255, 90, 31];

export function initVectorGrid() {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.className = 'vgrid';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let dots = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  const mouse = { x: -9999, y: -9999, active: false };

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    dots = [];
    const offX = (w % SPACING) / 2;
    const offY = (h % SPACING) / 2;
    for (let y = offY; y <= h; y += SPACING) {
      for (let x = offX; x <= w; x += SPACING) {
        dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
      }
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const dist = Math.hypot(d.hx - mouse.x, d.hy - mouse.y);
      const t = mouse.active ? Math.max(0, 1 - dist / RADIUS) : 0;
      const r = DIM[0] + (ACCENT[0] - DIM[0]) * t;
      const g = DIM[1] + (ACCENT[1] - DIM[1]) * t;
      const b = DIM[2] + (ACCENT[2] - DIM[2]) * t;
      ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      const size = 1.5 + t * 1;
      ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
    }
  }

  function step() {
    for (const d of dots) {
      let tx = d.hx;
      let ty = d.hy;
      if (mouse.active) {
        const dx = d.hx - mouse.x;
        const dy = d.hy - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < RADIUS && dist > 0.01) {
          const force = (1 - dist / RADIUS) ** 2 * PUSH;
          tx += (dx / dist) * force;
          ty += (dy / dist) * force;
        }
      }
      d.vx = (d.vx + (tx - d.x) * SPRING) * DAMPING;
      d.vy = (d.vy + (ty - d.y) * SPRING) * DAMPING;
      d.x += d.vx;
      d.y += d.vy;
    }
  }

  // Custom cursor: only where there is a real mouse.
  let cursorDot = null;
  let cursorRing = null;
  const ring = { x: -9999, y: -9999 };
  if (finePointer) {
    cursorDot = document.createElement('div');
    cursorRing = document.createElement('div');
    cursorDot.className = 'vcursor-dot';
    cursorRing.className = 'vcursor-ring';
    for (const el of [cursorDot, cursorRing]) {
      el.setAttribute('aria-hidden', 'true');
      document.body.append(el);
    }
    document.documentElement.classList.add('has-vcursor');
  }

  const interactive = 'a, button, [role="button"], input, select, textarea, label, summary';

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!mouse.active) {
        ring.x = mouse.x;
        ring.y = mouse.y;
      }
      mouse.active = true;
      document.documentElement.classList.add('vcursor-on');
      if (cursorRing) cursorRing.classList.toggle('is-hover', !!e.target.closest?.(interactive));
      if (reduced) draw();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('mouseleave', () => {
    mouse.active = false;
    document.documentElement.classList.remove('vcursor-on');
    if (reduced) draw();
  });
  window.addEventListener('pointerdown', () => cursorRing?.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursorRing?.classList.remove('is-down'));

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 100);
  });

  layout();

  function frame() {
    if (reduced) {
      // No easing or spring: dots stay put, only the colour follows the pointer.
      ring.x = mouse.x;
      ring.y = mouse.y;
    } else {
      step();
      draw();
      ring.x += (mouse.x - ring.x) * RING_EASE;
      ring.y += (mouse.y - ring.y) * RING_EASE;
    }
    if (cursorDot) {
      cursorDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      cursorRing.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
