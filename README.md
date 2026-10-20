# wohimlee.github.io

A zero-dependency bilingual personal site: a black signal-field hero, bold identity-led typography, and project stories presented as engineering diffs.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Where to edit

- `index.html` — introduction, projects, about, experience, and contact
- `resume.html` — printable resume content
- `styles.css` — black visual system, responsive layout, and print rules
- `i18n.js` — all Chinese and English interface copy
- `app.js` — language state, motion preference, project links, and signal canvas
- `favicon.svg` — the local `W/` browser mark
- `404.html` — not-found page

Search for `EDIT:` comments in the HTML to find the content that should be replaced first. Keep matching translations in both `zh` and `en` dictionaries in `i18n.js`; HTML contains the complete English no-JavaScript fallback. The site uses no framework, external font, or build step and can be served directly by GitHub Pages.
