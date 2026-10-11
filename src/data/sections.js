// Section labels (used in the menu and the "02 / About" tags) and section headlines.
// `em` is the orange italic word. Numbers are added automatically from the order below.
// Don't change the ids: the page and menu link to them.

export const sections = [
  { id: 'hello', label: 'Hello' },
  { id: 'about', label: 'About', toolsTitle: 'Tools I actually use' },
  {
    id: 'work',
    label: 'Work',
    headline: { before: "Things I've", em: 'built', after: '.' },
    // Shown while projects.js is empty.
    empty: {
      title: 'Projects are on their way here.',
      text: 'Until they land, everything I build lives on GitHub, half-finished experiments included.',
      cta: { label: 'See my GitHub', href: 'https://github.com/TirthNotFoundthedev' },
    },
    codeLabel: 'Code',
    liveLabel: 'Live',
  },
  {
    id: 'now',
    label: 'Now',
    headline: { before: "What I'm", em: 'into', after: 'right now.' },
    updatedPrefix: 'Updated',
  },
  {
    id: 'contact',
    label: 'Contact',
    headline: { before: 'Say', em: 'hi', after: '.' },
  },
];

export const section = (id) => sections.find((s) => s.id === id);
export const sectionNumber = (id) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0');
