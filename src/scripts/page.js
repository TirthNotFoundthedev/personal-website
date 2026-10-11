import { getIcons } from './pixel/icons.js';
import { toCanvas } from './pixel/grid.js';
import { ui, fill } from '../data/ui.js';
import { profile } from '../data/profile.js';

export function drawPixelIcons(root = document) {
  root.querySelectorAll('canvas[data-icon]').forEach((canvas) => {
    const sprite = getIcons()[canvas.dataset.icon];
    if (!sprite) return;
    canvas.width = sprite.w;
    canvas.height = sprite.h;
    canvas.getContext('2d').drawImage(toCanvas(sprite), 0, 0);
  });
}

function watchSections() {
  const sections = [...document.querySelectorAll('main > section[id]')];

  const lineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          lineObserver.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -15% 0px' },
  );
  sections.forEach((s) => s.classList.contains('section') && lineObserver.observe(s));
}

function wireCopyButtons() {
  const status = document.querySelector('.copy-status');
  let clearTimer = 0;
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      const label = btn.dataset.copyLabel;
      try {
        await navigator.clipboard.writeText(value);
        status.textContent = fill(ui.copy.done, { label, value });
      } catch {
        status.textContent = fill(ui.copy.failed, { label, value });
      }
      clearTimeout(clearTimer);
      clearTimer = setTimeout(() => (status.textContent = ''), 5000);
    });
  });
}

function consoleHello() {
  console.log(
    `%c${profile.handle}%c\n\n${ui.console}`,
    'font: 700 20px monospace; color: #ff5a1f;',
    'font: 13px monospace; color: inherit;',
  );
}

export function initPage() {
  drawPixelIcons();
  watchSections();
  wireCopyButtons();
  consoleHello();
}
