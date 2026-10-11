import { createGrid, outline } from './grid.js';

// Placeholder pixel-Tirth, drawn in code until a hand-made sprite sheet replaces it.
// Skin tone is a guess: change `skin*` here to match.
const C = {
  hair: '#16131c',
  hairHi: '#3a3550',
  hairHi2: '#5a5577',
  skin: '#c98c63',
  skinSh: '#a8704c',
  skinDk: '#8f5a3c',
  skinHi: '#dca07a',
  blush: '#d4876a',
  lens: '#e2b08a',
  sclera: '#f4ece2',
  frame: '#0b0a0c',
  frameHi: '#3a3a44',
  eye: '#1a1110',
  white: '#ffffff',
  mouth: '#6b2f22',
  lip: '#b06a4f',
  phone: '#ff5a1f',
  phoneSh: '#b8380c',
  phoneHi: '#ff8a5c',
  cushion: '#2a2a30',
  tee: '#ece6da',
  teeSh: '#c9c1b2',
  jacket: '#3a4150',
  jacketSh: '#2a303c',
  jacketHi: '#4d5668',
  jacketDk: '#20242e',
  jeans: '#34547f',
  jeansSh: '#253d60',
  jeansHi: '#4a6a98',
  belt: '#1b1b20',
  buckle: '#c9c1b2',
  shoe: '#ebe7df',
  shoeSh: '#b5afa4',
  soleHi: '#cfc9be',
  sole: '#8a847a',
  lace: '#9a948a',
  outline: '#070608',
};

export const TIRTH_W = 74;
export const TIRTH_H = 130;
// Top-left of the perched garuda canvas inside the Tirth canvas, so its talons land on the left shoulder.
export const GARUDA_PERCH = { x: 7, y: 18 };

function hand(g, x0, y0, x1, y1, thumbX) {
  g.fill(x0, y0, x1, y1, C.skin);
  g.fill(x0, y1, x1, y1, C.skinSh);
  g.fill(x0, y0, x1, y0, C.skinSh);
  for (let x = x0 + 1; x < x1; x += 2) g.set(x, y1 - 1, C.skinSh);
  if (thumbX !== undefined) g.fill(thumbX, y0 + 1, thumbX, y0 + 3, C.skin);
}

function hangingArm(g, x0, side) {
  const x1 = x0 + 4;
  const inner = side < 0 ? x1 : x0;
  const outer = side < 0 ? x0 : x1;
  g.fill(x0, 45, x1, 78, C.jacket);
  g.fill(inner, 47, inner, 78, C.jacketSh);
  g.fill(outer, 48, outer, 74, C.jacketHi);
  g.fill(x0 + 1, 58, x1 - 1, 58, C.jacketSh);
  g.fill(x0 + 2, 66, x1, 66, C.jacketSh);
  g.fill(x0, 77, x1, 78, C.jacketDk);
  hand(g, x0, 79, x1, 85, side < 0 ? x1 + 1 : x0 - 1);
}

/**
 * pose: 'idle' | 'wave1' | 'wave2' | 'shrug'
 * look: { x: -1..1, y: -1..0 } pupil offset
 * glint: -1 for none, otherwise 0..9 sweep position across the lenses
 */
export function buildTirth({ pose = 'idle', look = { x: 0, y: 0 }, blink = false, glint = -1 } = {}) {
  const g = createGrid(72, 128);

  // Hair mass
  g.fill(29, 4, 43, 4, C.hair);
  g.fill(26, 5, 46, 5, C.hair);
  g.fill(24, 6, 48, 6, C.hair);
  g.fill(23, 7, 49, 10, C.hair);
  g.fill(22, 11, 50, 14, C.hair);
  g.fill(22, 15, 25, 30, C.hair);
  g.fill(47, 15, 50, 30, C.hair);
  g.fill(31, 6, 37, 6, C.hairHi2);
  g.fill(28, 7, 40, 7, C.hairHi);
  g.fill(27, 8, 30, 8, C.hairHi);
  g.fill(39, 8, 42, 8, C.hairHi);
  g.fill(25, 10, 27, 10, C.hairHi);
  [[33, 9], [34, 10], [35, 11], [40, 10], [41, 11], [42, 12], [27, 11], [28, 12], [45, 9], [46, 10]].forEach(([x, y]) => g.set(x, y, C.hairHi));

  // Face
  g.fill(24, 14, 47, 34, C.skin);
  g.fill(25, 35, 46, 35, C.skin);
  g.fill(26, 36, 45, 36, C.skin);
  g.fill(28, 37, 43, 37, C.skinSh);
  g.fill(30, 38, 41, 38, C.skinSh);
  g.fill(24, 28, 25, 34, C.skinSh);
  g.fill(26, 35, 27, 36, C.skinSh);

  // Fringe, jagged on purpose
  g.fill(24, 14, 47, 14, C.hair);
  g.fill(24, 15, 30, 15, C.hair);
  g.fill(33, 15, 40, 15, C.hair);
  g.fill(43, 15, 47, 15, C.hair);
  g.fill(24, 16, 28, 16, C.hair);
  g.fill(34, 16, 38, 16, C.hair);
  g.fill(44, 16, 47, 16, C.hair);
  g.fill(24, 17, 26, 17, C.hair);
  g.fill(35, 17, 36, 17, C.hair);
  g.fill(45, 17, 47, 17, C.hair);
  g.fill(24, 18, 25, 18, C.hair);
  g.fill(46, 18, 47, 18, C.hair);
  g.fill(29, 15, 30, 15, C.hairHi);
  g.fill(37, 15, 38, 15, C.hairHi);

  // Headphones: two-pixel band over the hair, cups over the ears
  g.fill(30, 1, 42, 2, C.phone);
  g.fill(32, 1, 38, 1, C.phoneHi);
  g.fill(26, 2, 29, 3, C.phone);
  g.fill(43, 2, 46, 3, C.phone);
  g.fill(24, 3, 25, 4, C.phone);
  g.fill(47, 3, 48, 4, C.phone);
  g.fill(22, 4, 23, 5, C.phone);
  g.fill(49, 4, 50, 5, C.phone);
  g.fill(20, 5, 21, 19, C.phone);
  g.fill(51, 5, 52, 19, C.phone);
  g.fill(21, 6, 21, 19, C.phoneSh);
  g.fill(51, 6, 51, 19, C.phoneSh);
  for (const [x0, x1, cush] of [[17, 23, 23], [49, 55, 49]]) {
    g.fill(x0, 20, x1, 31, C.phone);
    g.fill(x0 + 1, 19, x1 - 1, 19, C.phone);
    g.fill(x0 + 1, 32, x1 - 1, 32, C.phone);
    g.fill(cush, 20, cush, 31, C.cushion);
    g.fill(x0 === 17 ? 17 : 55, 21, x0 === 17 ? 17 : 55, 30, C.phoneSh);
    g.fill(x0 === 17 ? 18 : 53, 21, x0 === 17 ? 18 : 53, 24, C.phoneHi);
    g.fill(x0 + 2, 31, x1 - 2, 31, C.phoneSh);
  }

  // Eyebrows, raised for the shrug
  const browY = pose === 'shrug' ? 19 : 20;
  g.fill(28, browY, 32, browY, C.hair);
  g.fill(27, browY + 1, 33, browY + 1, C.hair);
  g.fill(39, browY, 43, browY, C.hair);
  g.fill(38, browY + 1, 44, browY + 1, C.hair);

  // Glasses
  for (const x0 of [26, 37]) {
    g.fill(x0, 22, x0 + 8, 29, C.frame);
    g.fill(x0 + 1, 23, x0 + 7, 28, C.lens);
    g.fill(x0 + 1, 22, x0 + 4, 22, C.frameHi);
  }
  g.fill(35, 24, 36, 24, C.frame);
  g.fill(24, 23, 25, 23, C.frame);
  g.fill(46, 23, 47, 23, C.frame);

  // Eyes
  const lx = Math.max(-1, Math.min(1, Math.round(look.x)));
  const ly = Math.max(-1, Math.min(0, Math.round(look.y)));
  for (const sx of [28, 39]) {
    if (blink) {
      g.fill(sx, 26, sx + 4, 26, C.eye);
      g.set(sx - 1, 25, C.eye);
    } else {
      g.fill(sx, 24, sx + 4, 27, C.sclera);
      g.fill(sx + 1 + lx, 25 + ly, sx + 2 + lx, 27 + ly, C.eye);
      g.set(sx + 2 + lx, 25 + ly, C.white);
      g.fill(sx, 24, sx + 4, 24, C.lens);
    }
  }

  // Glasses glint: a short diagonal sweeping left to right
  if (glint >= 0) {
    for (const x0 of [27, 38]) {
      for (let k = 0; k < 4; k++) {
        const x = x0 + glint + k - 3;
        const y = 28 - k;
        if (x >= x0 && x <= x0 + 6) g.set(x, y, C.white);
      }
    }
  }

  // Nose, cheeks, mouth
  g.set(35, 28, C.skinHi);
  g.fill(36, 29, 36, 30, C.skinSh);
  g.fill(34, 31, 37, 31, C.skinSh);
  g.set(35, 30, C.skinSh);
  g.fill(28, 31, 29, 31, C.blush);
  g.fill(42, 31, 43, 31, C.blush);
  if (pose === 'shrug') {
    g.fill(33, 33, 38, 33, C.mouth);
  } else {
    g.fill(32, 33, 39, 33, C.mouth);
    g.fill(33, 34, 38, 34, C.lip);
    g.set(31, 32, C.mouth);
    g.set(40, 32, C.mouth);
  }

  // Neck
  g.fill(31, 39, 40, 43, C.skinSh);
  g.fill(31, 39, 40, 39, C.skinDk);

  // Torso: open jacket over a tee
  g.fill(26, 43, 45, 43, C.jacket);
  g.fill(23, 44, 48, 44, C.jacket);
  g.fill(22, 45, 49, 78, C.jacket);
  g.fill(30, 43, 41, 78, C.tee);
  g.fill(32, 43, 39, 43, C.skinSh);
  g.fill(33, 44, 38, 44, C.skinSh);
  g.set(31, 43, C.teeSh);
  g.set(40, 43, C.teeSh);
  g.set(32, 44, C.teeSh);
  g.set(39, 44, C.teeSh);
  g.fill(33, 45, 38, 45, C.teeSh);
  g.fill(30, 46, 30, 78, C.teeSh);
  g.fill(31, 77, 41, 78, C.teeSh);
  g.fill(29, 44, 29, 78, C.jacketSh);
  g.fill(42, 44, 42, 78, C.jacketSh);
  g.fill(28, 46, 28, 60, C.jacketHi);
  g.fill(43, 46, 43, 60, C.jacketHi);
  g.fill(23, 47, 23, 75, C.jacketHi);
  g.fill(48, 46, 49, 78, C.jacketSh);
  g.fill(44, 52, 47, 52, C.jacketSh);
  g.fill(44, 53, 44, 55, C.jacketSh);
  g.fill(23, 70, 27, 70, C.jacketSh);
  g.fill(44, 70, 48, 70, C.jacketSh);
  g.fill(22, 78, 29, 78, C.jacketDk);
  g.fill(42, 78, 49, 78, C.jacketDk);
  // "</>" print
  [[33, 55], [32, 56], [31, 57], [32, 58], [33, 59]].forEach(([x, y]) => g.set(x, y, C.phone));
  [[37, 54], [37, 55], [36, 56], [36, 57], [35, 58], [35, 59]].forEach(([x, y]) => g.set(x, y, C.phone));
  [[38, 55], [39, 56], [40, 57], [39, 58], [38, 59]].forEach(([x, y]) => g.set(x, y, C.phone));

  // Shoulder caps
  g.fill(16, 44, 23, 46, C.jacket);
  g.fill(48, 44, 55, 46, C.jacket);
  g.fill(17, 44, 21, 44, C.jacketHi);

  // Arms
  if (pose === 'shrug') {
    for (const [x0, fx0, fx1, hx0, cuffX0] of [[17, 6, 21, 1, 6], [50, 50, 65, 65, 63]]) {
      g.fill(x0, 45, x0 + 4, 62, C.jacket);
      g.fill(fx0, 62, fx1, 66, C.jacket);
      g.fill(fx0, 66, fx1, 66, C.jacketSh);
      g.fill(cuffX0, 62, cuffX0 + 2, 66, C.jacketDk);
      hand(g, hx0, 57, hx0 + 5, 63);
    }
  } else {
    hangingArm(g, 17, -1);
    if (pose === 'wave1' || pose === 'wave2') {
      g.fill(50, 45, 54, 50, C.jacket);
      g.fill(52, 51, 56, 56, C.jacket);
      g.fill(55, 34, 59, 56, C.jacket);
      g.fill(59, 34, 59, 56, C.jacketSh);
      g.fill(55, 40, 55, 52, C.jacketHi);
      g.fill(55, 33, 59, 34, C.jacketDk);
      const hx = pose === 'wave1' ? 54 : 56;
      g.fill(hx, 27, hx + 6, 32, C.skin);
      g.fill(hx, 32, hx + 6, 32, C.skinSh);
      for (const fx of [hx + 1, hx + 3, hx + 5]) g.fill(fx, 25, fx, 26, C.skin);
      g.fill(hx - 1, 29, hx - 1, 30, C.skin);
    } else {
      hangingArm(g, 50, 1);
    }
  }

  // Belt and jeans
  g.fill(25, 79, 46, 80, C.belt);
  g.fill(34, 79, 37, 80, C.buckle);
  g.fill(35, 80, 36, 80, C.belt);
  g.fill(28, 79, 28, 80, C.jeansSh);
  g.fill(43, 79, 43, 80, C.jeansSh);
  g.fill(25, 81, 46, 84, C.jeans);
  g.fill(35, 81, 35, 85, C.jeansSh);
  g.fill(27, 82, 29, 82, C.jeansSh);
  g.fill(42, 82, 44, 82, C.jeansSh);
  g.fill(25, 85, 34, 104, C.jeans);
  g.fill(37, 85, 46, 104, C.jeans);
  g.fill(26, 105, 34, 116, C.jeans);
  g.fill(37, 105, 45, 116, C.jeans);
  g.fill(34, 85, 34, 113, C.jeansSh);
  g.fill(37, 85, 37, 113, C.jeansSh);
  g.fill(26, 86, 26, 100, C.jeansHi);
  g.fill(45, 86, 45, 100, C.jeansHi);
  g.fill(28, 98, 31, 100, C.jeansHi);
  g.fill(40, 98, 43, 100, C.jeansHi);
  g.fill(29, 104, 32, 104, C.jeansSh);
  g.fill(39, 106, 42, 106, C.jeansSh);
  g.fill(26, 114, 34, 114, C.jeansHi);
  g.fill(37, 114, 45, 114, C.jeansHi);
  g.fill(26, 116, 34, 116, C.jeansSh);
  g.fill(37, 116, 45, 116, C.jeansSh);

  // Sneakers with an orange stripe
  for (const [x0, x1, dir] of [[22, 34, -1], [37, 49, 1]]) {
    g.fill(x0 + 3 - (dir > 0 ? 2 : 0), 117, x1 - 1 - (dir > 0 ? 2 : 0), 117, C.shoe);
    g.fill(x0, 118, x1, 121, C.shoe);
    g.fill(x0, 122, x1, 122, C.soleHi);
    g.fill(x0, 123, x1, 123, C.sole);
    const toe = dir < 0 ? x0 : x1 - 1;
    g.fill(toe, 119, toe + 1, 121, C.shoeSh);
    const mid = Math.round((x0 + x1) / 2);
    [mid - 3, mid - 1, mid + 1].forEach((x) => g.set(x, 118, C.lace));
    g.fill(mid - 4, 120, mid + 2, 120, C.phone);
    g.set(dir < 0 ? mid + 3 : mid - 5, 119, C.phone);
  }

  return outline(g, C.outline);
}
