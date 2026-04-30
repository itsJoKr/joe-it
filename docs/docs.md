# JOE IT Solutions — Website

## What this project is

A small marketing website for **JOE IT Solutions** (https://joe-it-solutions.com), a one-person Flutter / mobile / web consultancy run by Josip "Joe" Krnjic. It is a single-page sales pitch — no auth, no database, no backend logic. Visitors should:

1. Immediately understand what JOE IT Solutions does (Flutter / mobile / web app development).
2. See proof of work via a grid of past-project screenshots and a couple of personal projects.
3. Be able to reach out (contact email + social links).

The site replaces the existing Zyro-hosted site with something self-owned, faster, and easier to update via git.

## Goals

- **Replicate** the existing site's content and structure, then make it look a bit better and feel snappier.
- **Light footprint**: minimal tooling, minimal `node_modules`, easy to come back to in 6 months and remember how it works.
- **Deployable to Firebase Hosting** with one command.
- Mobile-first responsive.

## Non-goals

- No CMS, no admin panel, no database.
- No analytics beyond what Firebase Hosting offers out of the box (can add GA later).
- No i18n.
- No blog (yet).

## Technology choice

**Plain HTML + CSS + a sprinkle of vanilla JS.** No framework, no build step, no bundler.

### Why this stack

- The site is genuinely static. There's nothing dynamic that would benefit from React/Vue/Svelte's reactivity model.
- No build step means no `node_modules`, no `vite`/`webpack` to learn or update, no lockfile drift. Disk footprint stays in the kilobytes.
- Firebase Hosting natively serves static files — there's literally nothing to "build" before deploying.
- Editing a section is just opening `index.html` or `styles.css`. No mental overhead.
- The user explicitly said: *"I don't want technology that will require me to install a bunch of stuff that takes many GB."* This stack needs zero npm installs to develop. You just open `index.html` in a browser.

### What we will use

| Concern | Tool | Notes |
| --- | --- | --- |
| Markup | HTML5 (`index.html`) | Single page, semantic sections |
| Styling | CSS3 (`styles.css`) | CSS variables for theme, CSS Grid + Flexbox for layout, `@media` for responsiveness |
| Interactivity | Vanilla JS (`main.js`) | Mobile nav toggle, smooth scroll, that's it |
| Font | Figtree | Loaded via Google Fonts CDN (`<link>` in `<head>`). The local `.ttf` files in `resources/Figtree/` are kept as a fallback in case we ever want to self-host. |
| Icons | Inline SVG | A handful (LinkedIn, Twitter/X, email). No icon library. |
| Hosting | Firebase Hosting | `firebase.json` + `.firebaserc`, deploy via `firebase deploy` |
| Local preview | `python3 -m http.server` or VS Code Live Server | No npm needed. |

### What we are explicitly *not* using

- React / Vue / Svelte — overkill.
- Vite / Webpack / Parcel — no build needed.
- Tailwind — vanilla CSS keeps the file count and concept count low for a site this size.
- TypeScript — the JS is ~30 lines, not worth the setup.
- A package manager — there is no `package.json`. (Firebase CLI is the only Node tool, installed globally.)

## Repository layout

```
joe-it/
├── docs/
│   ├── docs.md                  # this file
│   └── dashboard.md             # detailed plan for the single page
├── resources/                   # source assets (kept out of public/)
│   ├── Figtree/
│   ├── company/                 # logo.png, joe-just.png, favicon.png
│   ├── past_projects/           # 16 phone screenshots
│   └── personal_projects/       # green_capitalist.avif, wall_street_bets.avif
├── public/                      # what Firebase serves — the actual site
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   ├── favicon.png
│   └── img/
│       ├── logo.png
│       ├── joe-just.png
│       ├── past/                # copied/optimized from resources/past_projects
│       └── personal/            # copied/optimized from resources/personal_projects
├── firebase.json
├── .firebaserc
└── .gitignore
```

`public/` is the deploy root. `resources/` stays in the repo as the source-of-truth for assets but is not deployed.

## Asset handling

- `resources/company/logo.png` → `public/img/logo.png` (header).
- `resources/company/joe-just.png` → `public/img/joe-just.png` (favicon-style accent / mobile header).
- `resources/company/favicon.png` → `public/favicon.png`.
- `resources/past_projects/*.png` → `public/img/past/` (16 phone screenshots for the portfolio grid).
- `resources/personal_projects/{green_capitalist,wall_street_bets}.avif` → `public/img/personal/` (the two personal projects we are keeping; football-with-friends and stock-wizard are dropped per the user's note).
- Figtree is loaded via Google Fonts; the local TTFs stay in `resources/` as a backup.

If page weight becomes an issue we can run the past-project PNGs through a one-shot optimizer (`pngquant` or web-based) — but only if needed.

## Content sources

Pulled from the existing site:

- Hero: *"IT Solutions"* / *"Expert Flutter solutions"*.
- About: *"Flutter Expert working with Flutter since it was in alpha. Worked on over 50 apps so far, including Flutter apps, native iOS, native Android and web apps."*
- Services: Mobile App Development, Web Development, UI/UX Design.
- Personal projects: Green Capitalist (clicker game with multiplayer aspect), Wall Street Bets: The Game (trading strategy game).
- Contact: `contact@joe-it-solutions.com` (mailto), LinkedIn (`https://www.linkedin.com/in/josipkrnjic/`), GitHub (`https://github.com/itsJoKr`). No Twitter/X.

Exact final copy is set in `dashboard.md`.

## Deployment plan

1. `npm install -g firebase-tools` (one-time, global — only Node thing we install).
2. `firebase login`.
3. `firebase init hosting` in the project root, choosing `public/` as the public directory and **not** configuring as a single-page app (no rewrite-everything-to-index needed).
4. `firebase deploy --only hosting`.
5. Connect the custom domain `joe-it-solutions.com` in the Firebase console (DNS A records + verification).

`firebase.json` will be minimal:

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      { "source": "**/*.@(png|avif|webp|jpg|jpeg|svg)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
    ]
  }
}
```

## Local development

No build step. Two options:

- Open `public/index.html` directly in a browser (works for everything except the rare CORS edge case).
- Or `cd public && python3 -m http.server 5173` and visit `http://localhost:5173`.

## Decisions

- **Contact**: single `mailto:contact@joe-it-solutions.com` button. No form, no backend.
- **Past projects grid**: all 16 screenshots from `resources/past_projects/`, in a responsive grid.
- **Social links**: LinkedIn (`https://www.linkedin.com/in/josipkrnjic/`) and GitHub (`https://github.com/itsJoKr`). No Twitter/X.
- **Theme**: light. Off-white surface (`#f6f7fb`) plus brand blue (matching the logo circle, ~`#1f4cff`).
