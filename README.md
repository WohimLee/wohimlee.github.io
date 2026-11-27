# wohimlee.github.io

A bilingual personal site with three homepage designs and a shared resume.

## Select the homepage

Use `academic-feature` as the baseline for homepage design and development. Set `homepage_variant` in [`_config.yml`](_config.yml) to select the live version. GitHub Pages builds that version at `https://wohimlee.github.io/` on each push to `main`.

| Value | Homepage |
| --- | --- |
| `black` | Original black homepage with a signal-field hero |
| `academic-masthead` | Centered Baskerville masthead and three project columns |
| `academic-feature` | Didot headline with the NEXA project open by default |

To switch or roll back, edit the value, preview, and commit it to `main`. An absent or unrecognized value selects `black`. Jekyll keeps the homepage templates in `_includes/` and publishes the selected version as `/` and `/index.html`.

## Preview locally

Install Jekyll with `gem install github-pages` if it is missing. Then run:

```bash
jekyll serve --destination /tmp/wohimlee-pages
```

Open `http://localhost:4000`. Restart Jekyll after changing `_config.yml`.

## Where to edit

- `index.html` — selects the homepage template
- `_includes/homepages/black.html` — original homepage
- `_includes/homepages/academic.html` and `academic.css` in the same folder — shared markup and styles for both academic designs
- `resume.html` — printable resume content
- `styles.css` — black visual system, responsive layout, and print rules
- `i18n.js` — all Chinese and English interface copy
- `app.js` — language state, motion preference, project links, and signal canvas
- `favicon.svg` — the local `W/` browser mark
- `404.html` — not-found page

Search for `EDIT:` comments in the original homepage and resume to find existing placeholders. Keep matching translations in the `zh` and `en` dictionaries in `i18n.js`, and update the corresponding HTML defaults for visitors without JavaScript. The black homepage defaults to English and the academic homepages default to Chinese. All versions use the browser's saved language preference when available.

## Publish updates

Preview and verify your changes locally, then commit the files for the update. From `main`, use `git fetch origin` and `git log --oneline --left-right origin/main...HEAD` to confirm the remote has no commits missing locally and review the commits you are about to publish.

```bash
git push origin main
```

GitHub Pages deploys automatically after a push to `main`. Check the deployment for your commit in [GitHub Actions](https://github.com/WohimLee/wohimlee.github.io/actions), then verify the [live site](https://wohimlee.github.io/).
