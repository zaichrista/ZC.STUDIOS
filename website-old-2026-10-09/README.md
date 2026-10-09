# ZC Studios website

Static site, no framework, no dependencies. One page, six full-screen scenes (hero, the big line, studio, cases, about, say hello).

## Run it locally

```
npm start        # http://localhost:3000
```

Use this rather than double-clicking `index.html`. The Adobe Fonts kit (Sets Grotesk) only loads on allowed domains, and the case-study text is fetched from `data/cases.json`, which browsers block on `file://`.

## Folder map

```
index.html              page markup (all six scenes)
css/style.css           all styling (colours are the two variables at the top: --ink, --paper)
js/main.js              scene-by-scene scrolling, animations, the cases scene
data/cases.json         case-study text (Brief / What we did / Result) - edit here, no code needed
assets/images/cases/    the two case-study screenshots shown on the site
assets/images/mockups/  design mockups (draft/ and official/). Reference only, NOT part of the live site
_archive/               old test copy of the page. Reference only
server.js               local preview server (npm start)
build.js                makes the upload folder (npm run build)
```

## Common edits

| To change | Edit |
|---|---|
| Case-study writing | `data/cases.json` (`rows` = label + text pairs) |
| A case image | replace the file in `assets/images/cases/` (keep the name, or update `index.html`) |
| Add a third case | add a `<a class="case ...">` block in `index.html`, an entry in `data/cases.json`, and its position in `css/style.css` (`.case.reach` / `.case.mand`) |
| Colours | `--ink` and `--paper` at the top of `css/style.css` (currently #0C0B09 and #F6F5F3) |
| Contact email | the `mailto:` link and text in the `#talk` section of `index.html` |
| Page title / description / share preview | `<head>` in `index.html` |

## Putting it live

```
npm run build    # creates dist/ with only the files the site needs
```

Deploy the **`dist/`** folder (not the whole project) to a static host such as Netlify, Cloudflare Pages or GitHub Pages, then point your domain at it.

Wix cannot take an HTML folder as a site. Either keep the domain on Wix and change its DNS to the host above, or paste the page into a Wix "Embed HTML" element (the scroll-by-section behaviour and fixed menu will likely clash with Wix's own page).

**Before launch:**
- In Adobe Fonts (kit `adg0sut`), add the live domain to the allowed domains, or visitors get a fallback font.
- Make sure the mailbox in the contact link exists.
- Re-run `npm run build` after any edit, then re-deploy `dist/`.

## Scrolling notes

One swipe = one scene (wheel, trackpad, touch swipe, arrow keys, space). Nav links jump straight to a scene. Escape closes an open case.
