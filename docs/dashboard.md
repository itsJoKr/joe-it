# Dashboard page (`index.html`)

The site is a single page. "Dashboard" here just means the one landing page that contains every section. This document is the implementation plan for that page.

## Page anatomy (top to bottom)

1. **Header / Nav** — sticky, transparent → solid on scroll.
2. **Hero** — headline + subhead + CTA + decorative grid of phone screenshots.
3. **About** — short intro paragraph about Joe.
4. **Services** — three cards: Mobile, Web, UI/UX.
5. **Personal Projects** — WMS (Warehouse Management System). Currently without a detail page.
6. **Games** — Green Capitalist + Wall Street Bets + RBMK-1000.
7. **Past Projects** — large responsive grid of all phone-screenshot thumbnails from `resources/past_projects/`.
8. **Contact** — "Let's work together" section with email CTA + social links.
9. **Footer** — small copyright + repeat of social links.

Each section gets an `id` so the nav links scroll to it (`#about`, `#services`, `#projects`, `#games`, `#past-work`, `#contact`).

## Design system

### Color palette

CSS variables defined on `:root`:

```css
:root {
  --brand: #1f4cff;          /* blue from the "joe" circle */
  --brand-dark: #0f2fb8;
  --bg: #ffffff;
  --bg-soft: #f6f7fb;        /* section alternate background */
  --surface: #ffffff;
  --text: #0e1530;           /* near-black with a blue tint */
  --text-muted: #5b6178;
  --border: #e6e8ef;
  --shadow: 0 8px 30px rgba(15, 24, 60, 0.08);
  --radius: 16px;
  --radius-sm: 10px;
}
```

Sections alternate between `--bg` and `--bg-soft` for visual separation without dividers.

### Typography

- Family: **Figtree**, 400 / 500 / 600 / 700 weights, with `system-ui` fallback.
- Loaded via Google Fonts:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
  ```
- Scale (clamp-based, fluid):
  - `h1`: `clamp(2.5rem, 5vw, 4.5rem)`, weight 700, letter-spacing -0.02em.
  - `h2`: `clamp(1.75rem, 3vw, 2.5rem)`, weight 700.
  - `h3`: `1.25rem`, weight 600.
  - `body`: `1rem` / `1.6` line-height, weight 400, color `--text-muted` for paragraphs.

### Spacing

- Section vertical padding: `clamp(4rem, 8vw, 7rem)`.
- Container max-width: `1180px`, horizontal padding `1.25rem` on mobile.
- Card padding: `1.5rem`.

### Reusable utility classes

- `.container` — centered wrapper, max-width 1180px.
- `.section` — vertical padding + `position: relative`.
- `.section--soft` — uses `--bg-soft`.
- `.eyebrow` — small uppercase tag above a section heading.
- `.btn`, `.btn--primary`, `.btn--ghost`.

## Section-by-section detail

### 1. Header / Nav

```
[ logo joe IT solutions ]                   Home  About  Services  Projects  Games  Contact   [Get in touch]
```

- Sticky (`position: sticky; top: 0;`).
- Default: transparent background. After ~40px scroll a JS handler adds `.is-scrolled` which switches to white background + bottom border + light shadow. (Tiny IntersectionObserver or `scroll` listener with `requestAnimationFrame` — ~10 lines in `main.js`.)
- Mobile (≤ 720px): nav links collapse into a hamburger that toggles a slide-down menu (`<button aria-expanded>`). One JS toggle.
- Logo on the left uses `img/logo.png` at `height: 36px`.
- "Get in touch" is a `--brand` filled button linking to `#contact`.

### 2. Hero

Two-column on desktop, stacked on mobile.

**Left column** (text):

- Eyebrow: `JOE IT SOLUTIONS`.
- H1: `IT Solutions you can ship.` (slight upgrade from current "IT Solutions").
- Subhead: `Expert Flutter, mobile, and web development — 50+ apps shipped since Flutter was alpha.`
- Two buttons: primary `Start a project` → `mailto:contact@joe-it-solutions.com`; ghost `See past work` → `#past-work`.

**Right column** (visual):

- A staggered 3×3 collage of six phone screenshots from `resources/past_projects/` chosen for visual variety (mix of dark + light + colorful). Slight rotation per tile (`transform: rotate(-4deg)` etc.) and `box-shadow: var(--shadow)`.
- Behind it, a soft radial-gradient blob in `--brand` at low opacity for color punch.
- On mobile (≤ 720px) the collage simplifies to a single horizontal scroll strip.

### 3. About

Single column, max-width ~720px, centered.

- Eyebrow: `ABOUT`.
- H2: `Hi, I'm Joe.`
- Paragraph: *"Flutter Expert working with Flutter since it was in alpha. I've shipped 50+ apps — Flutter, native iOS, native Android, and web. I work directly with founders and product teams to take ideas from sketch to App Store."*
- Optional: small inline `joe-just.png` (the round logo) as a decorative dot beside the heading.

Background: `--bg-soft`.

### 4. Services

Three equal-width cards (CSS Grid `grid-template-columns: repeat(3, 1fr)`, collapses to 1 column on mobile).

Each card:

```
┌─────────────────────────┐
│ [icon]                  │
│                         │
│ Mobile App Development  │
│                         │
│ Flutter, iOS, Android.  │
│ One codebase, native    │
│ feel, App Store ready.  │
└─────────────────────────┘
```

- Border `1px solid var(--border)`, `border-radius: var(--radius)`, padding `1.75rem`, white surface.
- Hover: lift (`transform: translateY(-4px)`, transition 180ms) + shadow.
- Icons: inline SVG (phone, globe, palette).

Three services and copy:

| Title | Body |
| --- | --- |
| Mobile App Development | Flutter-first. iOS and Android from a single codebase, with native modules where it matters. |
| Web Development | Marketing sites, web apps, and Flutter Web. Fast, accessible, deployable anywhere. |
| UI/UX Design | Wireframes to polished screens. Designed to ship, not to win awards. |

### 5. Personal Projects

One card (two-column grid on desktop, stacked on mobile). Currently without a detail page.

| Project | Image | Description |
| --- | --- | --- |
| WMS — Warehouse Management System | `img/projects/wms.png` | A warehouse management system built to streamline inventory tracking, order fulfillment, and logistics operations. |

Each card:

- White surface, `--radius`, `--shadow`, `overflow: hidden`.
- Image aspect ratio `16 / 9`, `object-fit: cover`.
- Text area with padding below the image.

### 6. Games

Three-card row (three columns on desktop, stacked on mobile).

Card layout: image on top, text below.

| Project | Image | Description |
| --- | --- | --- |
| Green Capitalist | `img/personal/green_capitalist.avif` | A clicker game with a multiplayer twist — build a green empire, race friends to net zero. |
| Wall Street Bets: The Game | `img/personal/wall_street_bets.avif` | A trading strategy game inspired by the community. Pick stonks, watch them moon (or not). |
| RBMK-1000 | `img/personal/rbmk_1000.png` | A Soviet nuclear reactor control room simulator. Balance power output against rising temperatures — not great, not terrible. |

Each card:

- White surface, `--radius`, `--shadow`, `overflow: hidden`.
- Optional small "play store" / "app store" link buttons if URLs exist (placeholder for now).

This section uses the **same card pattern** the user mentioned — described in `/past_projects` (the styling reference). Specifically: rounded corners, soft shadow, image bleeding to the card edge, padding inside text area.

### 7. Past Projects

Heading row:

- Eyebrow: `WORK`.
- H2: `A few apps I've shipped.`
- Sub: `Tap any thumbnail to see it bigger.` *(Lightbox optional — see "Stretch goals" below.)*

Grid:

- CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));`
- Gap: `1rem`.
- Each tile: phone screenshot in a wrapper with `aspect-ratio: 9 / 19` (matches phone screen ratio), `object-fit: cover`, `border-radius: var(--radius-sm)`, soft shadow.
- Hover: slight scale (`transform: scale(1.02)`) + brighter shadow.
- All 16 images from `resources/past_projects/` are listed; ordered by visual variety (alternate dark/light/colorful) rather than filename.

Background: `--bg-soft` so the tiles pop.

### 8. Contact

Centered, narrow column.

- Eyebrow: `CONTACT`.
- H2: `Let's work together.`
- Sub: `Got an idea? A half-finished prototype? A Flutter codebase nobody else wants to touch? I'd love to hear about it.`
- Big primary button: `Email contact@joe-it-solutions.com` → `mailto:contact@joe-it-solutions.com`.
- Below the button, a row of social icon links:
  - LinkedIn → `https://www.linkedin.com/in/josipkrnjic/`
  - GitHub → `https://github.com/itsJoKr`
- No email-capture form, no Twitter/X. Mailto is the only contact path.

### 9. Footer

- Two rows, both `--text-muted`, small font.
- Row 1 (left): `© 2026 JOE IT Solutions`. Row 1 (right): LinkedIn + GitHub icons.
- Background: `--text` (dark) with light text — gives a definite end to the page.

## JavaScript (`main.js`)

Total surface, ~40 lines:

1. **Sticky-nav scroll state** — toggle `.is-scrolled` on `<header>` past 40px.
2. **Mobile nav toggle** — click handler on hamburger button, toggles `aria-expanded` and a `.is-open` class on the nav.
3. **Smooth-scroll for in-page links** — actually CSS handles this via `html { scroll-behavior: smooth; }`, no JS needed. We rely on that.
4. **(Optional, stretch)** Tiny lightbox for past-project tiles: click a tile → fullscreen overlay with the image, click anywhere to close. ~25 lines, no library.

No frameworks, no bundling, no dependencies.

## Accessibility checklist

- Every `<img>` has a meaningful `alt`. For decorative collage tiles use `alt=""` and `role="presentation"` so screen readers skip them.
- The mobile nav button uses `aria-expanded` and `aria-controls`.
- Color contrast: text on `--bg`/`--bg-soft` checked at AA (WCAG) — `--text-muted` should be at least `#5b6178` against white (passes AA for body).
- Focus styles: visible `outline: 2px solid var(--brand); outline-offset: 3px;` on all interactive elements.
- `prefers-reduced-motion`: disable hover lifts and the smooth-scroll behavior when set.

## Performance notes

- Past-project PNGs total ~1.5 MB. Acceptable for desktop but worth optimizing — single-shot conversion to WebP would cut ~60%. Decision: **ship as PNG first**, optimize only if Lighthouse complains.
- All images get `loading="lazy"` except the hero collage (which is above the fold).
- Cache headers in `firebase.json` already set assets to `max-age=31536000, immutable`.
- No JS frameworks → no parse/eval cost.
- Target Lighthouse: ≥ 95 on Performance, Accessibility, Best Practices, SEO.

## SEO basics (in `<head>`)

```html
<title>JOE IT Solutions — Flutter, mobile, and web app development</title>
<meta name="description" content="Expert Flutter, iOS, Android, and web development. 50+ apps shipped since Flutter was alpha.">
<meta property="og:title" content="JOE IT Solutions">
<meta property="og:description" content="Expert Flutter, mobile, and web app development.">
<meta property="og:image" content="/img/og-cover.png">  <!-- TODO: generate -->
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/favicon.png">
```

`og-cover.png` is a TODO — can be generated later from the logo + a tagline.

## Build order (when we start coding)

1. Scaffold `public/` with empty `index.html`, `styles.css`, `main.js`.
2. Copy assets from `resources/` to `public/img/`.
3. Drop in CSS variables + base typography + container.
4. Build header → hero → about → services → personal projects → past projects → contact → footer, in that order. Test mobile after each section.
5. Wire the ~30 lines of JS.
6. `firebase init hosting` + `firebase deploy`.
7. Hook up the custom domain.

## Stretch goals (post-launch)

- Lightbox for past-project tiles.
- Auto-generated Open Graph image.
- Add a `/case-studies/<slug>.html` page for one or two flagship projects.
- Switch contact button to a real form via Formspree if the mailto link gets noisy.
