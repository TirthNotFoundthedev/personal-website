// Small interface text: buttons, the enter screen, the garuda, footer, 404 page.

export const ui = {
  hero: {
    hint: 'Poke us both.',
    soundOn: 'Sound on',
    mute: 'Mute',
    pause: 'Pause motion',
    play: 'Play motion',
    skipIntro: 'Skip intro',
    // Read out by screen readers for the clickable sprite and bird.
    spriteLabel: 'Pixel Tirth. Click to send the garuda on a lap.',
    garudaLabel: 'Garuda. Click to say hi.',
  },

  // What the garuda says when clicked.
  garudaLine: "Hi! I'm Garuda",

  // First-visit screen that unlocks sound.
  gate: {
    enter: 'Press any key to enter',
    note: 'Sound on.',
    quiet: 'Enter without sound',
  },

  menu: 'Menu',
  backToTop: 'Back to top',
  // {name} and {year} are filled in automatically.
  footer: '{name}, {year}. Built with Astro and too many pixels.',

  copy: {
    button: 'Copy',
    // {label} and {value} are filled in automatically.
    done: '{label} copied: {value}',
    failed: "Couldn't reach the clipboard. {label}: {value}",
  },

  notFound: {
    title: 'Page not found',
    headline: { before: 'TirthNotFound?', em: 'Found.', after: 'This page? Not so much.' },
    text: 'The garuda is out searching for it. While it looks, the rest of the site is right where I left it.',
    home: 'Take me home',
  },

  // Printed in the browser console for curious friends.
  console: 'Found me anyway. Say hi on Discord: tnf404\nThe garuda says hello too.',
};

// Fills {placeholders} in a ui string.
export const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? '');
