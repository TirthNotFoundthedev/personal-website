# Site content

Everything you'd want to change about the words on the site lives in this folder. Edit a file, save, and the dev server (`npm run dev`) updates the page.

| File | What it controls |
|---|---|
| `profile.js` | Name, handle, hero tagline, About headline and paragraphs, the scrolling "likes" strip |
| `tools.js` | Tech logos in the orbit and the About tools list, AI mascots in the outer orbit |
| `projects.js` | Project cards in Work (empty list shows the "on their way" message) |
| `now.js` | The Now section and its "updated" date |
| `contact.js` | Email, Discord and contact links |
| `sections.js` | Menu labels, section order, section headlines, Work's empty-state text |
| `ui.js` | Buttons, the enter screen, the garuda's line, footer, 404 page, console message |

A few rules of thumb:

- Text inside `'single quotes'` can't contain a `'` on its own. Use `"double quotes"` around text with apostrophes, like `"I'm Tirth"`.
- Headlines are `{ before, em, after }`. `em` is the orange italic word.
- Tools and mascots need an existing pixel icon. The available `key`s are listed at the top of each list in `tools.js`.
- Keep the section `id`s in `sections.js` as they are. The menu and page link to them.
