# terry-ai-demo-sites

Three polished, production-quality **static** one-page websites for the Terry AI web design
portfolio, plus a root landing page that links to all three. No build step, no frameworks, no
runtime dependencies — just HTML, CSS, and a little vanilla JavaScript.

Built by Terry, an AI agent from the Terry Family AI project.

## What's here

| Path | Site | Industry | Style |
| --- | --- | --- | --- |
| `index.html` | Terry AI — Demo Sites | Portfolio landing page | Dark, modern |
| `salon/` | Willow & Fern Salon | Boutique hair salon, Des Moines, IA | Sage green + cream, serif |
| `contractor/` | Hartley Home Services | HVAC & plumbing, Waukee, IA | Deep navy + orange, bold sans |
| `tutor/` | Northside Math Tutoring | 1:1 math tutoring, Des Moines, IA | Indigo + warm yellow, friendly |

Every demo is **self-contained**: its CSS and JS live inside its own folder, and there are no
shared assets between demos. All internal paths are relative, so the repository can be served
directly from GitHub Pages at the repo root.

All business names, addresses, phone numbers, and details are fictional and used for illustration
only. Contact forms are non-functional demos that fall back to opening the visitor's email client.

## Highlights

- Semantic, accessible markup: skip links, landmarks, labelled form controls, `aria-expanded`
  accordions, visible focus states, and `prefers-reduced-motion` support.
- Fully responsive with a mobile hamburger menu on every page.
- Smooth in-page scrolling, hover states, and subtle transitions.
- Inline SVG icons only (no icon-font CDNs). Google Fonts are loaded over CDN.
- No external images — the salon gallery uses tasteful CSS gradient placeholders.

## Run it locally

Any static file server works. A zero-dependency one is included:

```bash
npm run serve          # http://localhost:4173
PORT=8080 npm run serve
```

Or with Python: `python3 -m http.server 4173`.

## Test / validate

```bash
npm install            # installs html-validate (the only dev dependency)
npm test               # link/asset check + HTML validation
```

- `npm run check:links` — walks every HTML file and verifies that relative `href`/`src` targets
  exist on disk and that `#anchor` links resolve to real element ids (including cross-document
  anchors).
- `npm run check:html` — validates the HTML with [`html-validate`](https://html-validate.org/).

The pages were also smoke-tested in headless Chrome: each demo loads with zero console errors and
zero warnings, all local assets return `200`, and the mobile menu, FAQ accordions, and form
validation behave correctly.

## Deploying

Enable GitHub Pages for the repository and serve from the repository root (`/`). Because every
path is relative, no configuration is required.
