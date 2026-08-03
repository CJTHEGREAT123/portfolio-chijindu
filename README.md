# Chijindu Nwigwe Francis — Portfolio

Personal portfolio site for Chijindu Nwigwe Francis, Co-Founder, Co-CEO and CFO
of [ALCHIVON](https://www.alchivon.com/).

Live at **portfolio-chijindu.alchivon.com**

## Stack

Plain HTML, CSS and vanilla JavaScript. Three.js is loaded from a CDN for the
two 3D scenes. There is **no build step** — open `index.html` and it runs,
including from `file://`.

| | |
|---|---|
| Markup | `index.html` (two inline `<script type="module">` Three.js scenes) |
| Styles | `css/styles.css` (tokens, reset, shared) · `css/hero.css` · `css/sections.css` |
| Scripts | `js/main.js` (nav, reveal, counters, FAQ, parallax) · `js/github.js` (live GitHub stats) · `js/logo-data.js` |
| Assets | `assets/img/` screenshots · `assets/logo/` · `assets/docs/` CV and portfolio PDFs |

The design system (palette, type, glass/glow treatment) is shared with the
ALCHIVON site: `#030303` background, `#0B0F14` cards, `#12D8FF` primary,
`#0B6CFF` secondary, Space Grotesk headings, Inter body.

## Open Source section

`js/github.js` reads the GitHub REST API live on every page load. Nothing in
that section is hardcoded, and there is no fallback that invents a number — if
the request fails, the fields stay blank and say so.

## CV and Engineering Portfolio

`CV/` holds the print-first sources for both PDFs:

- `CV/cv.html` + `cv.css` — one A4 page
- `CV/portfolio.html` + `portfolio.css` — six A4 pages
- `CV/fonts/` — static per-weight webfonts

Rendered with headless Chrome at 794 × 1123px (A4 at 96dpi) into
`assets/docs/`. The fonts are **static, not variable** instances on purpose:
Chrome cannot embed a variable-font instance into a PDF and silently traces
every glyph as a Type3 path instead, which produces a PDF with no selectable
or ATS-readable text.

## Browser support

Modern evergreen browsers. The 3D scenes are gated behind an
IntersectionObserver and skip bloom on small or low-core devices; everything
degrades to a static layout without WebGL.
