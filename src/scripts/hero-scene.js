import { buildTirth, GARUDA_PERCH, TIRTH_W, TIRTH_H } from './pixel/tirth.js';
import { GARUDA } from './pixel/garuda.js';
import { getIcons, TECH_RES, MASCOT_RES } from './pixel/icons.js';
import { toCanvas } from './pixel/grid.js';

const TEXT = '#f3efe7';
const ACCENT = '#ff5a1f';
const TAU = Math.PI * 2;

// Intro timeline in ms. The page reveal is handed back to the caller at REVEAL_AT.
const T = {
  sprite: [0, 900],
  garudaLand: [700, 1400],
  name: [1000, 1900],
  tech: [1600, 2600],
  mascots: [2000, 3000],
};
const REVEAL_AT = 3000;
const FLIGHT_MS = 3200;
const BUBBLE_MS = 2400;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const progress = (t, [a, b]) => clamp((t - a) / (b - a), 0, 1);
const easeOut = (p) => 1 - (1 - p) ** 3;
const easeInOut = (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
const smoothstep = (a, b, x) => {
  const p = clamp((x - a) / (b - a), 0, 1);
  return p * p * (3 - 2 * p);
};

const garudaCanvas = Object.fromEntries(Object.entries(GARUDA).map(([k, g]) => [k, toCanvas(g)]));
const tirthCache = new Map();

function tirth(state) {
  const key = `${state.pose}|${state.look.x}|${state.look.y}|${state.blink}|${state.glint}`;
  if (!tirthCache.has(key)) tirthCache.set(key, toCanvas(buildTirth(state)));
  return tirthCache.get(key);
}

// Seeded so the dissolve pattern is identical on every visit.
function seededOrder(n) {
  let seed = 404;
  return Array.from({ length: n }, () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  });
}

export function createHeroScene({
  canvas,
  spriteButton,
  garudaButton,
  bubble,
  tag,
  name,
  handle,
  garudaLine,
  stack,
  mascots,
  playIntro,
  waitForStart,
  reducedMotion,
  onReveal,
  onCue,
}) {
  const ctx = canvas.getContext('2d');
  const icons = Object.fromEntries(Object.entries(getIcons()).map(([k, g]) => [k, toCanvas(g)]));
  const idleGrid = buildTirth();
  const dissolve = seededOrder(idleGrid.px.length);
  const ringText = `${name.toUpperCase()} // ${handle.toUpperCase()} // `;

  let w = 0;
  let h = 0;
  let p = 3;
  let rings = [];
  let flightRing = null;
  let hitboxes = [];

  // null means the intro is waiting behind the enter gate.
  let introT = playIntro && !reducedMotion ? (waitForStart ? null : 0) : Infinity;
  const cuesFired = new Set();
  const popped = {};
  let revealed = false;
  let paused = false;
  let hovered = null;
  let tapTimer = 0;
  let waving = false;
  let flightStart = -Infinity;
  let bubbleUntil = 0;
  let pointer = null;

  let orbitClock = 0;
  let idleClock = 0;
  let last = performance.now();
  let running = false;
  let visible = true;
  let rafId = 0;

  const cue = (name, arg) => onCue?.(name, arg);

  const spriteOrigin = () => ({
    x: Math.round(w / 2 - (TIRTH_W / 2) * p),
    y: Math.round(h * 0.47 - (TIRTH_H / 2) * p),
  });

  function layout() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    p = clamp(Math.floor(Math.min((h * 0.62) / TIRTH_H, (w * 0.75) / TIRTH_W)), 2, 6);
    const rx0 = Math.min(48 * p, w * 0.42);
    const rx1 = Math.min(Math.max(w * 0.33, rx0 + 24), w * 0.46);
    const rx2 = Math.max(w * 0.46, rx1 + 12);
    rings = [
      { key: 'name', rx: rx0, ry: rx0 * 0.28, rot: -0.08, speed: 0.00035, window: T.name },
      { key: 'tech', rx: rx1, ry: Math.min(Math.max(rx1 * 0.3, h * 0.1), h * 0.3), rot: 0.12, speed: -0.00016, window: T.tech, items: stack },
      { key: 'mascots', rx: rx2, ry: Math.min(Math.max(rx2 * 0.36, h * 0.18), h * 0.34), rot: -0.14, speed: 0.00011, window: T.mascots, items: mascots },
    ];
    flightRing = { rx: rings[2].rx * 0.8, ry: rings[2].ry * 0.6, rot: 0.1 };
    // Phones keep only the name ring; the logo rings crowd a narrow screen.
    if (w < 700) rings = rings.filter((r) => r.key === 'name');

    const o = spriteOrigin();
    Object.assign(spriteButton.style, {
      left: `${o.x + 16 * p}px`,
      top: `${o.y}px`,
      width: `${44 * p}px`,
      height: `${TIRTH_H * p}px`,
    });
    const perch = garudaCanvas.perched;
    Object.assign(garudaButton.style, {
      left: `${o.x + GARUDA_PERCH.x * p}px`,
      top: `${o.y + GARUDA_PERCH.y * p}px`,
      width: `${perch.width * p}px`,
      height: `${perch.height * p}px`,
    });
    placeBubble();
  }

  function placeBubble() {
    const o = spriteOrigin();
    bubble.style.left = `${o.x + (GARUDA_PERCH.x + 9) * p}px`;
    bubble.style.top = `${o.y + GARUDA_PERCH.y * p - 8}px`;
  }

  const center = () => {
    const o = spriteOrigin();
    return { x: w / 2, y: o.y + 62 * p };
  };

  function ringPoint(ring, theta, grow = 1) {
    const c = center();
    const x = ring.rx * grow * Math.cos(theta);
    const y = ring.ry * grow * Math.sin(theta);
    return {
      x: c.x + x * Math.cos(ring.rot) - y * Math.sin(ring.rot),
      y: c.y + x * Math.sin(ring.rot) + y * Math.cos(ring.rot),
      depth: Math.sin(theta),
    };
  }

  function drawTrack(ring, grow, alpha) {
    const c = center();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'rgba(243, 239, 231, 0.14)';
    ctx.setLineDash([2, 7]);
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, ring.rx * grow, ring.ry * grow, ring.rot, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function spriteState(now) {
    const blinkCycle = idleClock % 3800;
    const glintCycle = idleClock % 5200;
    let look = { x: 0, y: 0 };
    if (pointer) {
      const c = center();
      const headY = spriteOrigin().y + 26 * p;
      look = {
        x: clamp(Math.round((pointer.x - c.x) / (w * 0.18)), -1, 1),
        y: pointer.y < headY - 60 ? -1 : 0,
      };
    }
    let pose = 'idle';
    if (waving) pose = reducedMotion ? 'wave1' : Math.floor(now / 220) % 2 ? 'wave2' : 'wave1';
    return {
      pose,
      look,
      blink: !reducedMotion && blinkCycle < 130,
      glint: !reducedMotion && glintCycle < 500 ? Math.floor((glintCycle / 500) * 13) : -1,
    };
  }

  function drawSprite(now, sx, sy) {
    const reveal = progress(introT, T.sprite);
    if (reveal < 1) {
      // Pixel dissolve: each pixel appears once the reveal passes its random threshold.
      for (let y = 0; y < idleGrid.h; y++) {
        for (let x = 0; x < idleGrid.w; x++) {
          const i = y * idleGrid.w + x;
          const c = idleGrid.px[i];
          if (!c || dissolve[i] > reveal) continue;
          ctx.fillStyle = c;
          ctx.fillRect(sx + x * p, sy + y * p, p, p);
        }
      }
      return;
    }
    const img = tirth(spriteState(now));
    ctx.drawImage(img, sx, sy, img.width * p, img.height * p);
  }

  const flying = (now) => now - flightStart < FLIGHT_MS;

  function garudaPose(now) {
    const o = spriteOrigin();
    const perch = { x: o.x + GARUDA_PERCH.x * p, y: o.y + GARUDA_PERCH.y * p };
    const flap = Math.floor(now / 110) % 2 ? 'up' : 'down';
    const flyOffset = { x: -8 * p, y: 4 * p };

    const land = progress(introT, T.garudaLand);
    if (land < 1) {
      if (land <= 0) return null;
      const settled = land > 0.85;
      return {
        img: settled ? 'perched' : flap,
        x: perch.x + (settled ? 0 : flyOffset.x),
        y: perch.y + (settled ? 0 : flyOffset.y) - (1 - easeOut(land)) * 60 * p,
        depth: 1,
        alpha: Math.min(1, land * 3),
      };
    }

    const t = (now - flightStart) / FLIGHT_MS;
    if (t >= 0 && t < 1) {
      if (reducedMotion) return { img: 'up', x: perch.x + flyOffset.x, y: perch.y - 12 * p, depth: 1, alpha: 1 };
      const ring = flightRing;
      const c = { x: w / 2, y: o.y + 30 * p };
      const theta = Math.PI - TAU * easeInOut(t);
      const ox = ring.rx * Math.cos(theta);
      const oy = ring.ry * Math.sin(theta);
      const orbit = {
        x: c.x + ox * Math.cos(ring.rot) - oy * Math.sin(ring.rot) - 17 * p,
        y: c.y + ox * Math.sin(ring.rot) + oy * Math.cos(ring.rot) - 9 * p,
      };
      const mix = smoothstep(0, 0.18, t) * (1 - smoothstep(0.82, 1, t));
      const start = { x: perch.x + flyOffset.x, y: perch.y + flyOffset.y };
      return {
        img: mix < 0.05 ? 'perched' : flap,
        x: mix < 0.05 ? perch.x : start.x + (orbit.x - start.x) * mix,
        y: mix < 0.05 ? perch.y : start.y + (orbit.y - start.y) * mix,
        depth: mix > 0.4 ? Math.sin(theta) : 1,
        alpha: 1,
      };
    }

    // Perched idle: blinks, stretches its wings now and then, and hops while talking.
    const cycle = idleClock % 7000;
    let img = 'perched';
    if (!reducedMotion && cycle > 6700) img = 'up';
    else if (!reducedMotion && idleClock % 4400 < 140) img = 'perchedBlink';
    const talking = now < bubbleUntil && !reducedMotion;
    const hop = talking && Math.floor(now / 140) % 2 ? -p : 0;
    const offset = img === 'up' ? flyOffset : { x: 0, y: 0 };
    return { img, x: perch.x + offset.x, y: perch.y + offset.y + hop, depth: 1, alpha: 1 };
  }

  function collectRingDrawables(now) {
    const out = [];
    hitboxes = [];
    for (const ring of rings) {
      const appear = progress(introT, ring.window);
      if (appear <= 0) continue;
      const grow = 0.6 + 0.4 * easeOut(appear);
      const base = orbitClock * ring.speed;

      if (ring.key === 'name') {
        if (!cuesFired.has('name')) {
          cuesFired.add('name');
          cue('whoosh');
        }
        const chars = [...ringText];
        const step = TAU / chars.length;
        const nameLen = name.length;
        const fontPx = clamp(p * 8, 18, 44);
        chars.forEach((ch, i) => {
          if (ch === ' ' || i / chars.length > appear) return;
          // Offset so the name starts centred on the front of the ring.
          const pt = ringPoint(ring, base - (i - nameLen / 2) * step + Math.PI / 2, grow);
          const t01 = (pt.depth + 1) / 2;
          out.push({
            depth: pt.depth,
            draw() {
              ctx.save();
              ctx.globalAlpha = 0.3 + 0.7 * t01;
              ctx.fillStyle = i < nameLen ? TEXT : ACCENT;
              ctx.font = `${Math.round(fontPx * (0.65 + 0.35 * t01))}px Silkscreen, monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(ch, Math.round(pt.x), Math.round(pt.y));
              ctx.restore();
            },
          });
        });
        continue;
      }

      const n = ring.items.length;
      const big = ring.key === 'mascots';
      const shown = Math.min(n, Math.floor(appear * n + 0.999));
      for (let i = popped[ring.key] ?? 0; i < shown; i++) cue(big ? 'pop' : 'blip', i);
      popped[ring.key] = shown;

      ring.items.forEach((item, i) => {
        const pop = clamp(appear * n - i, 0, 1);
        if (pop <= 0) return;
        const pt = ringPoint(ring, base + (i * TAU) / n, grow);
        const img = icons[item.key];
        if (!img) return;
        // Phones get one step smaller icons so the rings don't bury the sprite.
        const front = w < 700 ? Math.max(2, p - 1) : p;
        const unit = pt.depth > -0.2 ? front : Math.max(1, front - 1);
        // Icons drawn on a finer grid get fewer screen pixels per art pixel, so all icons match in size.
        const baseRes = big ? MASCOT_RES : TECH_RES;
        const scale = Math.max(1, Math.round((unit * baseRes) / (img.width - 2))) * easeOut(pop);
        const bob = big && !reducedMotion ? Math.sin(now / 320 + i * 1.7) * p : 0;
        const dw = img.width * scale;
        const dh = img.height * scale;
        const x = Math.round(pt.x - dw / 2);
        const y = Math.round(pt.y - dh / 2 + bob);
        hitboxes.push({ x: pt.x, y: pt.y + bob, r: Math.max(dw, dh) * 0.55, depth: pt.depth, name: item.name });
        out.push({
          depth: pt.depth,
          draw() {
            ctx.save();
            ctx.globalAlpha = pt.depth < -0.2 ? 0.55 : 1;
            ctx.drawImage(img, x, y, dw, dh);
            ctx.restore();
          },
        });
      });
    }
    return out;
  }

  function render(now) {
    ctx.clearRect(0, 0, w, h);
    if (introT === null) return;
    const c = center();
    const spriteReveal = progress(introT, T.sprite);

    // Warm spotlight so black hair and the dark outline separate from the near-black page.
    const glow = ctx.createRadialGradient(c.x, c.y - 10 * p, 0, c.x, c.y - 10 * p, 70 * p);
    glow.addColorStop(0, `rgba(255, 90, 31, ${0.16 * spriteReveal})`);
    glow.addColorStop(1, 'rgba(255, 90, 31, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    for (const ring of rings) {
      const appear = progress(introT, ring.window);
      if (appear > 0) drawTrack(ring, 0.6 + 0.4 * easeOut(appear), appear);
    }

    const o = spriteOrigin();
    const bob = !reducedMotion && Math.floor(idleClock / 900) % 2 ? p : 0;
    const sy = o.y + bob;

    const drawables = collectRingDrawables(now);
    const bird = garudaPose(now);
    if (bird) {
      const img = garudaCanvas[bird.img];
      const scale = bird.depth < -0.2 ? Math.max(1, p - 1) : p;
      drawables.push({
        depth: bird.depth,
        draw() {
          ctx.save();
          ctx.globalAlpha = bird.alpha;
          ctx.drawImage(img, Math.round(bird.x), Math.round(bird.y + (bird.img.startsWith('perched') ? bob : 0)), img.width * scale, img.height * scale);
          ctx.restore();
        },
      });
    }

    drawables.sort((a, b) => a.depth - b.depth);
    drawables.filter((d) => d.depth < 0).forEach((d) => d.draw());
    drawSprite(now, o.x, sy);
    drawables.filter((d) => d.depth >= 0).forEach((d) => d.draw());
  }

  function updateTag() {
    if (!hovered) {
      tag.hidden = true;
      return;
    }
    tag.hidden = false;
    tag.textContent = hovered.name;
    tag.style.transform = `translate(${Math.round(hovered.x)}px, ${Math.round(hovered.y - hovered.r - 8)}px) translate(-50%, -100%)`;
  }

  function findHit(x, y) {
    const hits = hitboxes.filter((b) => b.depth > -0.2 && Math.hypot(b.x - x, b.y - y) < b.r);
    hits.sort((a, b) => b.depth - a.depth);
    return hits[0] || null;
  }

  function setHovered(next) {
    if (next && next.name !== hovered?.name) cue('hover');
    hovered = next;
    updateTag();
  }

  function fireIntroCues() {
    const once = (key, at, name) => {
      if (introT >= at && !cuesFired.has(key)) {
        cuesFired.add(key);
        cue(name);
      }
    };
    once('sprite', 0, 'materialize');
    once('land', T.garudaLand[1] - 100, 'chirp');
  }

  function frame(now) {
    const dt = Math.min(64, now - last);
    last = now;
    if (introT !== null && introT !== Infinity) {
      introT += dt;
      fireIntroCues();
      if (introT >= REVEAL_AT) finishIntro();
    }
    if (!paused) idleClock += dt;
    if (!paused && !hovered) orbitClock += dt;
    if (bubbleUntil && now > bubbleUntil) hideBubble();
    render(now);
    rafId = running ? requestAnimationFrame(frame) : 0;
  }

  function startLoop() {
    if (running || reducedMotion || !visible) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  // Reduced motion draws single frames on demand instead of looping.
  function redraw() {
    if (running) return;
    render(performance.now());
  }

  function finishIntro() {
    const wasPlaying = introT !== Infinity && introT !== null;
    introT = Infinity;
    if (!revealed) {
      revealed = true;
      if (wasPlaying) cue('stinger');
      onReveal?.();
    }
  }

  function hideBubble() {
    bubbleUntil = 0;
    bubble.hidden = true;
  }

  const toLocal = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  window.addEventListener('pointermove', (e) => {
    const pt = toLocal(e);
    pointer = pt;
    if (e.pointerType === 'mouse') {
      setHovered(pt.x >= 0 && pt.y >= 0 && pt.x <= w && pt.y <= h ? findHit(pt.x, pt.y) : null);
    }
    redraw();
  });

  canvas.addEventListener('pointerdown', (e) => {
    const pt = toLocal(e);
    setHovered(findHit(pt.x, pt.y));
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => setHovered(null), 2200);
  });

  canvas.addEventListener('pointerleave', () => setHovered(null));

  let waveTimer = 0;
  const stopWave = () => {
    waving = false;
    redraw();
  };
  const startWave = (e) => {
    waving = true;
    redraw();
    // Touch never fires a matching pointerleave, so a tap waves briefly instead.
    clearTimeout(waveTimer);
    if (e?.pointerType && e.pointerType !== 'mouse') waveTimer = setTimeout(stopWave, 1400);
  };
  spriteButton.addEventListener('pointerenter', startWave);
  spriteButton.addEventListener('pointerleave', stopWave);
  spriteButton.addEventListener('focus', startWave);
  spriteButton.addEventListener('blur', stopWave);
  spriteButton.addEventListener('click', () => {
    const now = performance.now();
    if (flying(now) || introT !== Infinity) return;
    hideBubble();
    flightStart = now;
    cue('whoosh');
    cue('chirp');
    redraw();
    if (reducedMotion) setTimeout(redraw, FLIGHT_MS + 20);
  });

  garudaButton.addEventListener('click', () => {
    const now = performance.now();
    if (flying(now) || introT !== Infinity) return;
    placeBubble();
    bubble.hidden = false;
    // Re-setting the text makes screen readers announce it again on repeat clicks.
    bubble.textContent = '';
    bubble.textContent = garudaLine;
    bubbleUntil = now + BUBBLE_MS;
    cue('hi');
    redraw();
    if (reducedMotion) setTimeout(hideBubble, BUBBLE_MS);
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) startLoop();
    else stopLoop();
  }).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  new ResizeObserver(() => {
    layout();
    redraw();
  }).observe(canvas);

  layout();
  if (introT === Infinity) finishIntro();
  startLoop();
  redraw();

  return {
    begin() {
      if (introT === null) introT = 0;
      startLoop();
    },
    skipIntro() {
      if (introT !== Infinity) finishIntro();
      redraw();
    },
    setPaused(value) {
      paused = value;
      redraw();
    },
  };
}
