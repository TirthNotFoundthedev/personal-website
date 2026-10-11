// Tiny chiptune synth on Web Audio. Browsers only allow audio after a user gesture,
// so nothing plays until unlock() runs inside a click or key handler.

const PENTA = [0, 2, 4, 7, 9];
const noteHz = (step, base = 523.25) => base * 2 ** ((PENTA[step % 5] + 12 * Math.floor(step / 5)) / 12);

let ctx = null;
let master = null;
let enabled = false;

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
  }
  ctx.resume();
  enabled = true;
  return true;
}

export function setEnabled(value) {
  if (value) return unlock();
  enabled = false;
  return true;
}

export const isEnabled = () => enabled;

function tone({ type = 'square', from, to = from, at = 0, dur = 0.08, vol = 1 }) {
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function whoosh({ at = 0, dur = 0.6, from = 300, to = 3200, vol = 0.5 }) {
  const t = ctx.currentTime + at;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 3;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(amp).connect(master);
  src.start(t);
}

const SOUNDS = {
  materialize() {
    for (let i = 0; i < 12; i++) tone({ from: noteHz(i, 261.63), at: i * 0.07, dur: 0.06, vol: 0.5 });
  },
  whoosh: () => whoosh({}),
  blip: (i = 0) => tone({ from: noteHz(i + 5), dur: 0.07, vol: 0.45 }),
  pop: (i = 0) => tone({ type: 'triangle', from: noteHz(i + 8), to: noteHz(i + 3), dur: 0.12, vol: 0.9 }),
  chirp() {
    tone({ type: 'sine', from: 1700, to: 3300, dur: 0.07, vol: 0.6 });
    tone({ type: 'sine', from: 1900, to: 3600, at: 0.09, dur: 0.08, vol: 0.6 });
  },
  hi() {
    [0, 0.11, 0.22].forEach((at, i) => tone({ type: 'sine', from: 1500 + i * 300, to: 2900 + i * 200, at, dur: 0.08, vol: 0.6 }));
  },
  stinger() {
    [0, 4, 7, 12].forEach((semi, i) => tone({ from: 261.63 * 2 ** (semi / 12), at: i * 0.07, dur: 0.18, vol: 0.5 }));
    tone({ type: 'triangle', from: 130.81, at: 0.28, dur: 0.5, vol: 0.9 });
  },
  hover: () => tone({ from: 1046.5, dur: 0.04, vol: 0.25 }),
};

export function play(name, arg) {
  if (!enabled || !ctx || !SOUNDS[name]) return;
  SOUNDS[name](arg);
}
