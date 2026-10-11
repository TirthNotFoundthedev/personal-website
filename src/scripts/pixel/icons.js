import { createGrid, outline } from './grid.js';
import { LOGO_PATHS } from './logo-paths.js';

// Icons are drawn as vectors on a 24-unit board, then snapped to a small pixel grid
// with a fixed palette, so the resolution is one number per icon.
export const TECH_RES = 20;
export const MASCOT_RES = 24;
const OUTLINE = '#070608';

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function raster(size, palette, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.scale(size / 24, size / 24);
  draw(ctx);
  const data = ctx.getImageData(0, 0, size, size).data;
  const pal = palette.map((hex) => [hex, hexToRgb(hex)]);
  const g = createGrid(size, size);
  for (let i = 0; i < size * size; i++) {
    if (data[i * 4 + 3] < 128) continue;
    const [r, gg, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
    let best = pal[0][0];
    let bestD = Infinity;
    for (const [hex, [pr, pg, pb]] of pal) {
      const d = (r - pr) ** 2 + (gg - pg) ** 2 + (b - pb) ** 2;
      if (d < bestD) [best, bestD] = [hex, d];
    }
    g.set(i % size, Math.floor(i / size), best);
  }
  return outline(g, OUTLINE);
}

const fillPath = (ctx, key, color) => {
  ctx.fillStyle = color;
  ctx.fill(new Path2D(LOGO_PATHS[key]));
};

const poly = (ctx, color, pts) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
};

const ellipse = (ctx, color, x, y, rx, ry, rot = 0) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
};

const SHIELD = [[1.5, 0], [22.5, 0], [20.6, 21.5], [12, 24], [3.4, 21.5]];

const defs = {
  python: [TECH_RES, ['#3b77a8', '#ffd43b'], (ctx) => {
    // Two-tone split along the anti-diagonal: blue snake top-left, yellow bottom-right.
    for (const [color, tri] of [['#3b77a8', [[0, 0], [24, 0], [0, 24]]], ['#ffd43b', [[24, 0], [24, 24], [0, 24]]]]) {
      ctx.save();
      ctx.beginPath();
      tri.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.clip();
      fillPath(ctx, 'python', color);
      ctx.restore();
    }
  }],
  javascript: [TECH_RES, ['#f7df1e', '#1a1a1a'], (ctx) => {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0.5, 0.5, 23, 23);
    fillPath(ctx, 'javascript', '#f7df1e');
  }],
  html: [TECH_RES, ['#e44d26', '#f16529', '#ffffff'], (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 4, 14, 16);
    fillPath(ctx, 'html5', '#e44d26');
    ctx.save();
    ctx.beginPath();
    ctx.rect(12, 0, 12, 24);
    ctx.clip();
    fillPath(ctx, 'html5', '#f16529');
    ctx.restore();
  }],
  css: [TECH_RES, ['#264de4', '#2965f1', '#ffffff'], (ctx) => {
    poly(ctx, '#264de4', SHIELD);
    poly(ctx, '#2965f1', [[12, 0], [22.5, 0], [20.6, 21.5], [12, 24]]);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3', 12, 12);
  }],
  git: [TECH_RES, ['#f05032'], (ctx) => fillPath(ctx, 'git', '#f05032')],
  github: [TECH_RES, ['#f0f0f0'], (ctx) => fillPath(ctx, 'github', '#f0f0f0')],
  vscode: [TECH_RES, ['#23a9f2', '#0065a9', '#1f88d0'], (ctx) => {
    poly(ctx, '#1f88d0', [[17.5, 1], [17.5, 7], [5.5, 16.5], [2, 13.5]]);
    poly(ctx, '#0065a9', [[17.5, 23], [17.5, 17], [5.5, 7.5], [2, 10.5]]);
    poly(ctx, '#0065a9', [[0.8, 9], [3, 8], [3, 16], [0.8, 15]]);
    poly(ctx, '#23a9f2', [[16.5, 0.5], [23.2, 3.5], [23.2, 20.5], [16.5, 23.5]]);
  }],
  linux: [TECH_RES, ['#3a3a44', '#f4f4f4', '#f7b500', '#141418'], (ctx) => {
    ellipse(ctx, '#3a3a44', 12, 12.5, 7.6, 10);
    ellipse(ctx, '#f4f4f4', 12, 15.5, 5.2, 6.4);
    ellipse(ctx, '#f4f4f4', 9.4, 7, 1.7, 2.1);
    ellipse(ctx, '#f4f4f4', 14.6, 7, 1.7, 2.1);
    ellipse(ctx, '#141418', 9.8, 7.4, 0.8, 1);
    ellipse(ctx, '#141418', 14.2, 7.4, 0.8, 1);
    ellipse(ctx, '#f7b500', 12, 10.2, 2.8, 1.4);
    ellipse(ctx, '#f7b500', 7.2, 22, 3.8, 1.7);
    ellipse(ctx, '#f7b500', 16.8, 22, 3.8, 1.7);
  }],
  cpp: [TECH_RES, ['#00599c', '#ffffff'], (ctx) => {
    ellipse(ctx, '#ffffff', 12, 12, 8.5, 8.5);
    fillPath(ctx, 'cplusplus', '#00599c');
  }],

  claude: [MASCOT_RES, ['#d97757', '#b85c3e', '#1a0f0a'], (ctx) => {
    // Clawd is already pixel art, so it is drawn on whole units.
    const r = (c, x, y, w, h) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w, h);
    };
    r('#d97757', 4, 4, 16, 11);
    r('#d97757', 1, 9, 22, 3);
    r('#b85c3e', 4, 14, 16, 1);
    r('#1a0f0a', 8, 7, 1.6, 3);
    r('#1a0f0a', 14.4, 7, 1.6, 3);
    for (const x of [5, 8, 14, 17]) r('#d97757', x, 15, 2, 4);
  }],
  openclaw: [MASCOT_RES, ['#e8402f', '#b3271c', '#ffffff', '#140808'], (ctx) => {
    ctx.strokeStyle = '#b3271c';
    ctx.lineWidth = 1.4;
    for (const [x0, y0, x1, y1] of [[6, 15, 2.5, 20], [8, 16.5, 6, 21.5], [18, 15, 21.5, 20], [16, 16.5, 18, 21.5], [7, 11, 4.5, 8], [17, 11, 19.5, 8]]) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    for (const sx of [-1, 1]) {
      const cx = 12 + sx * 8.2;
      ellipse(ctx, '#e8402f', cx, 5.5, 3.6, 3.6);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      poly(ctx, '#000', [[cx, 5.6], [cx - sx * 0.6, 0.6], [cx + sx * 3.8, 1.8]]);
      ctx.restore();
    }
    ellipse(ctx, '#e8402f', 12, 14, 7.5, 5);
    ellipse(ctx, '#b3271c', 12, 16.5, 6, 2.2);
    ctx.fillStyle = '#e8402f';
    ctx.fillRect(9, 5.5, 1.4, 5);
    ctx.fillRect(13.6, 5.5, 1.4, 5);
    ellipse(ctx, '#ffffff', 9.7, 5, 1.7, 1.7);
    ellipse(ctx, '#ffffff', 14.3, 5, 1.7, 1.7);
    ellipse(ctx, '#140808', 10, 5.2, 0.8, 0.8);
    ellipse(ctx, '#140808', 14.6, 5.2, 0.8, 0.8);
  }],
  // Finer grid than the other mascots so the open smile and fingers read clearly.
  huggingface: [40, ['#ffd21e', '#ffe36b', '#f2a900', '#2b1a0c', '#ef4b4b', '#ffb31a', '#d98200', '#ffffff'], (ctx) => {
    ellipse(ctx, '#f2a900', 12, 10.6, 9.6, 9.4);
    ellipse(ctx, '#ffd21e', 12, 10.2, 9.3, 9);
    ellipse(ctx, '#ffe36b', 10, 5.4, 4.2, 2.2, -0.3);
    // Eyes
    ellipse(ctx, '#2b1a0c', 8.4, 8.2, 1.25, 1.7);
    ellipse(ctx, '#2b1a0c', 15.6, 8.2, 1.25, 1.7);
    ellipse(ctx, '#ffffff', 8.8, 7.5, 0.45, 0.5);
    ellipse(ctx, '#ffffff', 16, 7.5, 0.45, 0.5);
    // Open smile with the tongue tucked inside it
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(6.8, 10.6);
    ctx.quadraticCurveTo(12, 11.6, 17.2, 10.6);
    ctx.quadraticCurveTo(16.4, 16.6, 12, 16.8);
    ctx.quadraticCurveTo(7.6, 16.6, 6.8, 10.6);
    ctx.closePath();
    ctx.fillStyle = '#2b1a0c';
    ctx.fill();
    ctx.clip();
    ellipse(ctx, '#ef4b4b', 12, 16.4, 3.4, 2);
    ctx.restore();
    // Hugging hands, fingers wrapped forward
    for (const side of [-1, 1]) {
      const cx = 12 + side * 7.4;
      ellipse(ctx, '#ffb31a', cx, 18.6, 4.4, 3.3, side * 0.45);
      ctx.strokeStyle = '#d98200';
      ctx.lineWidth = 0.55;
      ctx.lineCap = 'round';
      for (let f = 0; f < 3; f++) {
        const fx = cx - side * (0.6 + f * 1.4);
        ctx.beginPath();
        ctx.moveTo(fx, 16.6 + f * 0.5);
        ctx.lineTo(fx + side * 1.1, 18.4 + f * 0.6);
        ctx.stroke();
      }
    }
  }],
  ollama: [MASCOT_RES, ['#ececec'], (ctx) => fillPath(ctx, 'ollama', '#ececec')],
  copilot: [MASCOT_RES, ['#e6e6ea'], (ctx) => fillPath(ctx, 'githubcopilot', '#e6e6ea')],
  // Current Gemini mark: the four-point star in Google blue, green, yellow and red.
  gemini: [MASCOT_RES, ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#3fa3d9', '#f28b2a'], (ctx) => {
    const grad = ctx.createConicGradient(-Math.PI / 2, 12, 12);
    grad.addColorStop(0, '#4285f4');
    grad.addColorStop(0.25, '#34a853');
    grad.addColorStop(0.5, '#fbbc04');
    grad.addColorStop(0.75, '#ea4335');
    grad.addColorStop(1, '#4285f4');
    ctx.fillStyle = grad;
    ctx.fill(new Path2D(LOGO_PATHS.googlegemini));
  }],
};

let cache = null;

// Rasterising needs a DOM canvas, so icons are built on first use in the browser.
export function getIcons() {
  if (!cache) {
    cache = Object.fromEntries(Object.entries(defs).map(([key, [size, palette, draw]]) => [key, raster(size, palette, draw)]));
  }
  return cache;
}
