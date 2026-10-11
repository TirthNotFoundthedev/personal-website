// Who you are: name, intro lines, About text and the things-I-like strip.

export const profile = {
  name: 'Tirth Zalavadia',
  handle: 'TirthNotFound',

  // Hero, top-left on desktop. Also the page description for search engines.
  tagline: "I'm Tirth, and I code. Currently studying in college, learning how to build cool tech.",

  about: {
    // `em` is the orange italic word in the middle of the headline.
    headline: { before: 'I learn by', em: 'solving', after: 'everything that could make my life easier.' },
    // The first paragraph is shown larger.
    paragraphs: [
      "I'm a student pursuing a B.Tech in CSE with AI/ML, and I love tinkering with tech, whether it's hardware or software.",
      'This site is where those projects end up. It is also a project itself, so expect it to change.',
    ],
  },

  // The scrolling strip under the hero: things I like, not things I know.
  likes: [
    'Discord & Telegram bots',
    'Backend development',
    'Bansuri',
    'Puzzles',
    "Rubik's Cube",
    'Minecraft',
    'Football',
  ],
};
