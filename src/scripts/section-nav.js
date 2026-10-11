// One section index that travels with the scroll, after the ArtCraft reference:
// waiting labels stack bottom-right; as a section scrolls in, its label slides onto the
// timeline rail, climbs it, then docks in the header as the current section title.
// Every letter follows the path with a small delay, so names move letter by letter.

const LIST_BOTTOM = 28;
const RAIL_SCALE = 1.6;
const DOCK_SCALE = { desktop: 2.2, phone: 1.15 };
// Fractions of a section's approach spent sliding onto the rail, and leaving it for the header.
const SLIDE_END = 0.14;
const CLIMB_END = 0.86;
// Progress lag between neighbouring letters.
const LETTER_LAG = 0.022;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
const lerp = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  rot: a.rot + (b.rot - a.rot) * t,
  scale: a.scale + (b.scale - a.scale) * t,
  alpha: (a.alpha ?? 1) + ((b.alpha ?? 1) - (a.alpha ?? 1)) * t,
});

// Staggered progress for letter j of n; the last letter leads, since it is on top when climbing.
function letterT(t, j, n, reduced) {
  if (reduced || n < 2) return t;
  const lag = (n - 1 - j) * LETTER_LAG;
  return clamp((t - lag) / (1 - (n - 1) * LETTER_LAG), 0, 1);
}

export function initSectionNav() {
  const nav = document.querySelector('.section-nav');
  const labels = [...nav.querySelectorAll('.sn-label')];
  const letters = labels.map((l) => [...l.querySelectorAll('.sn-ch')]);
  const sections = labels.map((l) => document.getElementById(l.dataset.section));
  const header = document.querySelector('.site-header');
  const logo = header.querySelector('.logo');
  const menuToggle = header.querySelector('.menu-toggle');
  const rail = document.querySelector('.rail');
  const marker = rail.querySelector('.rail-marker');
  const pct = rail.querySelector('.rail-pct');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = matchMedia('(min-width: 960px)');

  let sizes = [];
  let queued = false;

  function measure() {
    nav.classList.add('is-measuring');
    sizes = labels.map((l, i) => ({
      w: l.offsetWidth,
      h: l.offsetHeight,
      offsets: letters[i].map((ch) => ch.offsetLeft),
    }));
    nav.classList.remove('is-measuring');
  }

  function place(ch, pos, ox) {
    ch.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px) rotate(${pos.rot.toFixed(1)}deg) scale(${pos.scale.toFixed(3)}) translateX(${ox}px)`;
    ch.style.opacity = pos.alpha.toFixed(3);
  }

  function update() {
    queued = false;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const hh = header.offsetHeight;
    const gutter = logo.getBoundingClientRect().left;
    const railW = rail.offsetWidth;
    const desktop = wide.matches;
    const dockScale = desktop ? DOCK_SCALE.desktop : DOCK_SCALE.phone;
    const dockRight = vw - gutter - (!desktop && menuToggle ? menuToggle.offsetWidth + 12 : 0);

    // 0 when the section's top is at the bottom of the viewport, 1 when it reaches the header.
    const ts = sections.map((s) => clamp((vh - s.getBoundingClientRect().top) / (vh - hh), 0, 1));
    const docked = ts.reduce((acc, t, i) => (t >= 1 ? i : acc), -1);
    const waiting = ts.flatMap((t, i) => (t <= 0 ? [i] : []));

    labels.forEach((el, i) => {
      const { w, h, offsets } = sizes[i];
      const n = offsets.length;
      const t = ts[i];
      const dock = { x: dockRight - w * dockScale, y: (hh - h * dockScale) / 2, rot: 0, scale: dockScale, alpha: 1 };
      const slot = (k, count) => ({ x: vw - railW - gutter - w, y: vh - LIST_BOTTOM - (count - k) * (h + 6), rot: 0, scale: 1, alpha: 1 });
      const railX = vw - railW / 2 - (h * RAIL_SCALE) / 2;
      const railBottom = { x: railX, y: vh - 24, rot: -90, scale: RAIL_SCALE, alpha: 1 };
      const railTop = { x: railX, y: hh + 24 + w * RAIL_SCALE, rot: -90, scale: RAIL_SCALE, alpha: 1 };
      const aboveDock = { ...dock, y: dock.y - hh, alpha: 0 };

      // The old title leaves letter by letter while the next one docks.
      const next = ts[i + 1] ?? 0;
      const exit = t >= 1 ? clamp((next - CLIMB_END) / (1 - CLIMB_END), 0, 1) : 0;

      let gone = false;
      if (t >= 1 && exit >= 1) gone = true;
      if (!desktop && t < CLIMB_END) gone = true;

      letters[i].forEach((ch, j) => {
        let pos;
        if (t >= 1) {
          const e = letterT(exit, j, n, reduced);
          pos = lerp(dock, aboveDock, reduced ? Math.round(e) : ease(e));
        } else if (!desktop) {
          const tj = letterT(t, j, n, reduced);
          pos = tj < CLIMB_END ? aboveDock : lerp(aboveDock, dock, ease((tj - CLIMB_END) / (1 - CLIMB_END)));
        } else if (t <= 0 || reduced) {
          const k = waiting.indexOf(i);
          pos = k >= 0 ? slot(k, waiting.length) : slot(0, waiting.length + 1);
        } else {
          const tj = letterT(t, j, n, reduced);
          const from = slot(0, waiting.length + 1);
          if (tj < SLIDE_END) pos = lerp(from, railBottom, ease(tj / SLIDE_END));
          else if (tj < CLIMB_END) pos = lerp(railBottom, railTop, (tj - SLIDE_END) / (CLIMB_END - SLIDE_END));
          else pos = lerp(railTop, dock, ease((tj - CLIMB_END) / (1 - CLIMB_END)));
        }
        place(ch, pos, offsets[j]);
      });

      el.classList.toggle('is-gone', gone);
      el.classList.toggle('is-docked', i === docked);
      if (i === docked) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
      if (gone) el.setAttribute('tabindex', '-1');
      else el.removeAttribute('tabindex');
    });

    const max = document.documentElement.scrollHeight - vh;
    const progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    marker.style.transform = `translateY(${(progress * (rail.clientHeight - 2)).toFixed(1)}px)`;
    pct.textContent = `${Math.round(progress * 100)}%`;
  }

  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => {
    measure();
    queue();
  });
  wide.addEventListener('change', () => {
    measure();
    queue();
  });
  document.fonts?.ready.then(() => {
    measure();
    update();
  });

  measure();
  update();
}
