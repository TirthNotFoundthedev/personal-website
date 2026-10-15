// What orbits pixel-you in the hero.
// `key` picks the pixel icon, drawn in src/scripts/pixel/icons.js. Only keys that exist there
// show an icon; to add a new tool or mascot, its icon has to be drawn there first.
// `name` is the label shown on hover and in the About tools list.

// The "Tools I actually use" list in About, and the middle ring (see techRing below).
// Available keys: python, javascript, html, css, git, github, vscode, linux, cpp, pi, rubiks
export const stack = [
  { key: 'python', name: 'Python' },
  { key: 'javascript', name: 'JavaScript' },
  { key: 'html', name: 'HTML' },
  { key: 'css', name: 'CSS' },
  { key: 'git', name: 'Git' },
  { key: 'github', name: 'GitHub' },
  { key: 'vscode', name: 'VS Code' },
  { key: 'linux', name: 'Linux' },
  { key: 'cpp', name: 'C / C++' },
];

// Middle ring: the stack above, with HTML and CSS swapped for pi and a Rubik's cube.
const ringSwaps = {
  html: { key: 'pi', name: 'π' },
  css: { key: 'rubiks', name: "Rubik's Cube" },
};
export const techRing = stack.map((t) => ringSwaps[t.key] ?? t);

// Outer ring.
// Available keys: claude, openclaw, huggingface, ollama, copilot, gemini
export const mascots = [
  { key: 'claude', name: 'Claude Code' },
  { key: 'openclaw', name: 'OpenClaw' },
  { key: 'huggingface', name: 'Hugging Face' },
  { key: 'ollama', name: 'Ollama' },
  { key: 'copilot', name: 'GitHub Copilot' },
  { key: 'gemini', name: 'Gemini' },
];
