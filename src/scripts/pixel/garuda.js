import { fromRows, mirror, outline } from './grid.js';

// Front-facing and crowned like the classic Garuda emblem: regal rather than cute.
// Rows are left halves; the last character is the centre column.
const P = {
  o: '#f07a2a',
  O: '#ff9a4d',
  s: '#8f3418',
  g: '#ffbf3f',
  c: '#ffd84d',
  C: '#d9a521',
  r: '#e0313f',
  y: '#ffe6a0',
  Y: '#e0b060',
  k: '#140c08',
  w: '#ffffff',
};
const OUTLINE = '#070608';

const perched = [
  '......c.c',
  '......ccc',
  '......ccr',
  '......CCC',
  '.....oOOO',
  '....okwOO',
  '....oOOOy',
  '....soOyy',
  '.....sOyY',
  '......ooY',
  '.....sooo',
  '...gsoOOO',
  '..ggsoOOO',
  '.gggsoOOO',
  'gggsoOOOO',
  'gggsoOOOO',
  'ggsgsOOOO',
  'gsgsooOOO',
  'gsgsooOOO',
  '.sgsooooO',
  '.ssgsoooo',
  '..ssgsooo',
  '...sssooo',
  '....ssooo',
  '......yy.',
  '.....y.y.',
];

const wingsUp = [
  'gg...............',
  'sgg..............',
  'ssgg..........c.c',
  '.ssgg.........ccr',
  '..ssgg......oOOOO',
  '...ssgg.....okwOO',
  '....ssgg....oOOOy',
  '.....ssgg...soOyy',
  '......ssgg...sOyY',
  '.......ssgg.soooY',
  '........ssgsoOOOO',
  '.........ssoOOOOO',
  '..........soOOOOO',
  '...........sooOOO',
  '............soooo',
  '............sgsgs',
  '...........sgsgsg',
  '..........sg.g.g.',
];

const wingsDown = [
  '.................',
  '.................',
  '..............c.c',
  '..............ccr',
  '............oOOOO',
  '............okwOO',
  '............oOOOy',
  '............soOyy',
  '.............sOyY',
  '........ggs.soooY',
  '......gggsgsoOOOO',
  '....ggssg..soOOOO',
  '..ggss.....soOOOO',
  '.gss.......sooOOO',
  'gs..........soooo',
  'g...........sgsgs',
  '...........sgsgsg',
  '..........sg.g.g.',
];

const build = (halves) => outline(fromRows(mirror(halves), P), OUTLINE);
const blink = (halves) => halves.map((row) => row.replace(/[kw]/g, 's'));

export const GARUDA = {
  perched: build(perched),
  perchedBlink: build(blink(perched)),
  up: build(wingsUp),
  down: build(wingsDown),
};
