// A sprite is { w, h, px } where px is a flat array of CSS colours, null for transparent.

export function createGrid(w, h) {
  const px = new Array(w * h).fill(null);
  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  return {
    w,
    h,
    px,
    set(x, y, c) {
      if (inside(x, y)) px[y * w + x] = c;
    },
    get(x, y) {
      return inside(x, y) ? px[y * w + x] : null;
    },
    // Inclusive corners read closer to the pixel coordinates sketched on paper.
    fill(x0, y0, x1, y1, c) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, c);
    },
  };
}

// Rows use one character per pixel; '.' is transparent.
export function fromRows(rows, palette) {
  const w = Math.max(...rows.map((r) => r.length));
  const g = createGrid(w, rows.length);
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.' && ch !== ' ') g.set(x, y, palette[ch] ?? null);
    });
  });
  return g;
}

// Builds symmetric rows from their left half; the last character is the centre column.
export function mirror(halves) {
  return halves.map((left) => left + [...left.slice(0, -1)].reverse().join(''));
}

export function outline(g, color) {
  const out = createGrid(g.w + 2, g.h + 2);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) out.set(x + 1, y + 1, g.get(x, y));
  const snapshot = out.px.slice();
  const filled = (x, y) => x >= 0 && y >= 0 && x < out.w && y < out.h && snapshot[y * out.w + x];
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      if (filled(x, y)) continue;
      if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) out.set(x, y, color);
    }
  }
  return out;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Renders at 1:1; callers scale with drawImage and imageSmoothingEnabled = false.
export function toCanvas(g) {
  const canvas = document.createElement('canvas');
  canvas.width = g.w;
  canvas.height = g.h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(g.w, g.h);
  g.px.forEach((c, i) => {
    if (!c) return;
    const [r, gg, b] = hexToRgb(c);
    img.data.set([r, gg, b, 255], i * 4);
  });
  ctx.putImageData(img, 0, 0);
  return canvas;
}
