# Modus WMS — product page plan

A standalone, scroll-driven product page for **Modus WMS**, a customizable warehouse-management system built on Flutter / Serverpod (source: `~/ServerpodProjects/dmr/`).

The page lives on the same site as `joe-it-solutions.com` but **does not** share its chrome — different theme, different font, different navigation. Standalone product page, link to the main site only via a small footer.

---

## 1. Goals

- Communicate one core message: **the WMS adapts to your workflow, not the other way around.**
- Walk the visitor through a single end-to-end flow — *receive an order, pick it, ship it, see it in stock* — using highly choreographed scroll animations (Apple product-page feel).
- Recreate the Flutter app's UI in HTML/CSS so screens can be animated element-by-element (new order slides into the list, scanner highlights an item, etc.). Static screenshots can't do this.
- Bilingual: English ↔ Croatian, in-page toggle.
- One CTA: contact / request demo.

## 2. Non-goals

- No live demo, no signup, no auth, no backend. It's a marketing page.
- No video. Animations are HTML/CSS/SVG, scrubbed by scroll position.
- No pricing on v1 (decision pending — see open questions).
- No JOE IT Solutions header/footer reuse — fully self-contained look.

---

## 3. Tech stack

Same constraint as the parent site (no `node_modules`, no build), with one CDN library.

| Concern | Tool |
|---|---|
| Markup | `public/modus-wms/index.html` |
| Styling | `public/modus-wms/styles.css` (dark theme, Space Grotesk, scoped — no leakage from `/styles.css`) |
| Interactivity | `public/modus-wms/main.js` (vanilla JS) |
| Scroll animations | **GSAP + ScrollTrigger** via jsdelivr CDN (~35 KB gzipped) |
| Font | **Space Grotesk** via Google Fonts (matches the Flutter app exactly) |
| Icons | Inline SVG (recreate the bottom-nav icons + package, scanner, truck, etc.) |
| i18n | Plain `data-i18n` attributes + JS string table; toggle persists in `localStorage` |

Why GSAP+ScrollTrigger and not native CSS scroll-driven animations: choreography is non-trivial (pin a section, scrub multiple element timelines together, snap between steps). CSS `animation-timeline: scroll()` is close, but `view-timeline` Safari support is still spotty in 2026; GSAP handles all browsers and gives us a real timeline we can author. We keep the rest of the parent site framework-free.

Loaded once at the bottom of `<body>`:
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="/modus-wms/main.js" defer></script>
```

---

## 4. Visual language (mirroring the Flutter app)

Pulled from `dmr_flutter/lib/outer/services/theme/theme_service.dart`:

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#131313` | Page background |
| `--surface` | `#1A1A1A` | Cards, sheets |
| `--surface-2` | `#222222` | Slightly raised (modal, hover) |
| `--text` | `#E5E2E1` | Primary text |
| `--text-muted` | `#D6C4AC` | Labels (warm beige — distinctive) |
| `--text-dim` | `#9E8E78` | Inactive icons / secondary |
| `--accent` | `#FFB300` | Primary buttons, highlight bar |
| `--accent-soft` | `#FFD79B` | Hover, glow |
| `--accent-ink` | `#432C00` | Text on accent |
| `--danger` | `#FFB4AB` | Errors / over-pick warnings |
| `--border` | `#2C2C2C` | Card outlines |

Type:
- Family: `'Space Grotesk', system-ui, sans-serif`, weights 400/500/600/700.
- Headings: uppercase with `letter-spacing: 0.04em` for the section eyebrows (matches `NARUDŽBE`, `STANJE`, `INVENTURA` in the screenshots).
- Body: 16px / 1.6.

Cards in the recreated UI carry a **2px yellow left accent stripe** — visible in `orders.png` and `stock.png`.

---

## 5. File layout

```
public/
├── modus-wms/
│   ├── index.html              # the product page
│   ├── styles.css              # scoped to this page (.mw-* prefix)
│   ├── main.js                 # GSAP timelines + i18n toggle
│   ├── i18n.js                 # { en: {...}, hr: {...} } string table
│   └── img/
│       ├── device-tc57.png     # from resources/wms/
│       ├── device-rfd90.png
│       ├── device-bluetooth.png
│       └── og.png              # social-share preview
```

The Flutter screen recreations are **HTML, not images** — we only use raster assets for the device photos and as OG/social preview fallback.

`firebase.json` already serves everything under `public/`. No config changes needed.

---

## 6. Recreated Flutter screens — the "phone mockup" component

We need to reproduce three screens in HTML/CSS so we can animate their internals:

### 6.1 Phone frame

```
.mw-phone
├── .mw-phone__notch        (Dynamic-Island-ish pill at top)
├── .mw-phone__screen       (the area where app content lives)
└── .mw-phone__home-indicator
```

- Outer frame: rounded 36px, dark gradient bezel (`#0a0a0a → #1f1f1f`), thin highlight border.
- Screen: `aspect-ratio: 9/19.5`, background `#131313`.
- Status bar at top with a fixed time (`9:41`) — pick one and stick with it.
- Bottom nav with five SVG icons (stock / audit / orders / book / person) — only the **active** icon is colored. Active depends on which screen we're animating.

This is one reusable component, parameterized by a `data-screen="orders|scanner|stock"` attribute.

### 6.2 Orders screen (`orders.png`)

```
NARUDŽBE                                       (header eyebrow)

[ ✓ Dolazno ]  [ 🚚 Izlazno ]                  (segmented control, pill)

┌────────────────────────────────────────┐    (each row: card with yellow stripe)
│ TTT                                    │
│ Status         Stvoreno      Odredište │
│ Primljeno      24.04 15:06   Sisak     │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ REC-1777040258448                      │
│ ...                                    │
└────────────────────────────────────────┘
                                  [+ Nova]
```

Each `.mw-order-row` is a flex row with a 3px `.mw-stripe` on the left. Status text is uppercase muted, value is bold off-white. We animate by inserting a *new* `.mw-order-row` at the top with a `translateY(-100%) → 0` + opacity transition when scroll hits the trigger.

### 6.3 Scanner screen (`scanner.png` + the guided pick we are inventing)

The current `scanner.png` only shows the camera viewfinder; the guidance UI ("go to Zone A, Shelf B, pick up Item INOX-TRUSS-14mm") doesn't exist in the app yet. We invent it for marketing — and we're upfront about that internally; it's representative of the product direction. **Confirm with user before shipping.**

Layout:
```
[ ←  ]            🔊        [ Gotovo ]
[ ✓ Kamera ] [ Hardver ] [ Ručno ]

┌─── Camera viewfinder ───────────┐
│  (a stylized barcode SVG with   │
│   green corner brackets and a   │
│   sliding red scan line)        │
└─────────────────────────────────┘

┌──── Pick guidance card ─────────┐  ← appears as part of step 2
│ NEXT                            │
│ Zone A › Shelf B-3              │
│ INOX-TRUSS-14mm    × 2          │
│ ────────────────────────────    │
│ [progress bar 1/3]              │
└─────────────────────────────────┘

[scanned items list — empty / 1 of 3 / 3 of 3 over animation]
```

The scan line is `@keyframes` only (we don't want GSAP to control everything). The card appears via GSAP when scroll is at this section.

### 6.4 Stock screen (`stock.png`)

Straight recreation of the `STANJE` list:
- `+ DODAJ` and `PRIJENOS` buttons at top (yellow primary + ghost).
- Stack of `.mw-stock-row`s — each shows SKU / Količina / Lokacija columns.
- We don't animate row-by-row here; just a soft fade-in with stagger so the screen feels "settled."

---

## 7. Page structure (top → bottom)

The page is one long scroll. Each numbered section corresponds to a GSAP `ScrollTrigger`. Sections marked **(pinned)** stay in the viewport while their internal timeline scrubs.

### S1. Hero
- Centered wordmark: **`Modus WMS`** (title case, Space Grotesk 700, 6rem clamp). No logo asset — type only.
- Tagline: **"WMS that works for you."** (eyebrow above) / Subline: *"Customizable warehouse management. Adapts to your flow — not the other way around."*
- Two CTAs: `Get a demo` (primary, yellow) + `Watch the flow` (ghost, scrolls to S2).
- Background: subtle radial gradient in `--accent` at ~6% opacity. A few floating SVG specks (boxes, barcodes) parallax on scroll.
- Scroll cue at the bottom — bouncing chevron.

### S2. The pitch — "One product, your workflow"
- Two columns, large quote-style copy.
- Left: *"Most WMS make you adapt your warehouse. Modus adapts to it."*
- Right: three short bullets — Custom fields, Automations, Configurable picking. Each bullet fades in as scroll reaches it.

### S3. **(pinned)** Step 1 — *Order arrives*

Layout while pinned:
```
LEFT side                    RIGHT side
─────────────                ──────────────
ERP / WooCommerce  ────►     [phone: orders screen]
icon cluster
+ short copy
```

Animation (scrub):
1. Three labeled tiles sit in a column on the left — **ERP**, **WebShop**, **Custom** — each just a typeset label inside a bordered card with a small generic icon (no real-brand logos; the app supports anything that can call a webhook).
2. As scroll progresses, a small "data packet" SVG (a yellow square with `POST /webhook` micro-text) flies along an SVG path from one of the tiles → into the top of the phone screen. The active source tile cycles ERP → WebShop → Custom over the timeline.
3. On arrival, a new `.mw-order-row` slides in at the top of the orders list. Existing rows shift down.
4. Step counter "01 / 04" pinned in the top-left corner.

Copy: *"Anything that can hit a webhook can feed Modus — your ERP, your webshop, or whatever you build. Orders land the moment they're created."*

### S4. **(pinned)** Step 2 — *Scan & pick*

- Phone swaps to the **scanner screen** (cross-fade, not a route swap).
- Animation timeline:
  1. The "Pick guidance" card slides up from the bottom showing **"Zone A › Shelf B-3 — INOX-TRUSS-14mm × 2"**.
  2. A floating SVG box-with-barcode drifts in from the right and aligns inside the camera viewfinder.
  3. Red scan line sweeps. On the scan, the guidance card flips to a green "✓ Picked" state and the progress bar advances `0/3 → 1/3 → 2/3 → 3/3` as the user keeps scrolling.
  4. Once at 3/3, the card collapses into a "Ready to ship" pill.

- **Side panel — "Scan however you want"**: mini-cards with the device images.
  - **Phone camera** — generic phone outline / screenshot of the camera tab.
  - **Zebra Android scanner (TC57)** — `device-tc57.png`.
  - **Zebra RFID scanner (RFD90)** — `device-rfd90.png`.
  - **Bluetooth scanners** — `device-bluetooth.png`.
  - **Manual entry** — keyboard SVG.
  - These cards are arranged in a row beneath the phone; on scroll they highlight one-by-one with a yellow ring as a piece of copy explains each (GSAP stagger).

Copy lead: *"Camera, Zebra hardware, Bluetooth scanners, or manual — same flow, your choice."*

### S5. **(pinned)** Step 3 — *Confirm & ship*

- Phone shows a generated "Shipment summary" screen we mock: customer name, 3-line address, list of picked items, big yellow `OTPREMI` (Ship) button.
- Animation: address lines type in (like CLI text), button pulses, on "ship" a paper-plane SVG flies off the screen to the right and fades into a small map blip.

Copy: *"Modus tells your team where it goes. One tap, the order is shipped."*

### S6. **(pinned)** Step 4 — *Stock updates everywhere*

- Phone swaps to the **stock screen** (`STANJE`).
- Animation:
  1. The just-shipped item's quantity row pulses briefly (decrement) while the previous-step's plane lands.
  2. Numbers on multiple rows tick down/up using a quick `requestAnimationFrame` counter.

Copy: *"Stock recalculates the moment goods move. Across warehouses, zones, and shelves."*

### S7. "And more" — feature grid (no scroll choreography, just a clean grid)

Six tiles, each a small card with icon + name + one-line description:

1. **Audits** — *Plan, count, reconcile. Bring the warehouse back to truth.*
2. **Receiving** — *Inbound goods, supplier-aware, one tap to verify.*
3. **Transfers** — *Move stock between warehouses with full traceability.*
4. **Automations** — *Trigger flows on events. Print labels, notify, route.*
5. **Custom fields** — *Add fields per item, location, or order. No code.*
6. **Multi-warehouse** — *Sisak, Zagreb, anywhere. One source of truth.*

These map to `dmr/docs/features/` so copy can be tightened against the real feature docs.

### S8. Why "customizable" actually means something
- Three side-by-side columns: *Custom fields*, *Automations*, *Configurable picking*. Each shows a tiny code-ish snippet or screenshot fragment proving the customization is real, not a buzzword.

### S9. CTA
- Big centered: **"Make Modus yours."** + button → `mailto:contact@joe-it-solutions.com?subject=Modus WMS demo`.
- Small footer: copyright, language toggle, and a discreet link back to `joe-it-solutions.com`.

---

## 8. Animation rules of thumb

- **Scrub, don't autoplay.** Each pinned section's timeline is bound to scroll position so the user controls the pace.
- **Snap to sections** on desktop only (ScrollTrigger's `snap`), so each pinned story step finishes cleanly before the next starts. On mobile, drop the snap — it fights touch scroll.
- **Mobile fallback** (`<= 720px`): replace pinned scrubbed sections with simple fade-in-on-enter. Same content, no choreography. Detect via `matchMedia('(min-width: 900px)')` inside ScrollTrigger setup.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` disables all GSAP timelines and shows the final state of each step.
- **Performance**: precompose with `will-change: transform, opacity` on the moving elements only. No box-shadow animation. SVG path animations use `stroke-dashoffset`, not `d`.

---

## 9. i18n approach

- **String table** in `i18n.js`:
  ```js
  export const I18N = {
    en: { 'hero.title': 'WMS that works for you.', 'hero.cta.demo': 'Get a demo' /* ... */ },
    hr: { 'hero.title': 'WMS koji radi za vas.', 'hero.cta.demo': 'Zatraži demo' /* ... */ }
  };
  ```
- HTML elements carry `data-i18n="hero.title"` and (where needed) `data-i18n-attr="title:hero.cta.tooltip"`.
- Toggle: a small `[ EN | HR ]` pill in the top-right of the page header. Clicking flips a `<html lang>` attribute, sets `localStorage.lang`, and re-runs the substitution.
- Default lang: `en` (override if visitor's browser is `hr-*`).
- The recreated app screens stay in **Croatian** (matches `NARUDŽBE`, `STANJE`, `INVENTURA` from the screenshots) regardless of UI language — they're showing the actual product. We only translate the marketing chrome.

---

## 10. Page header (minimal, not the JOE IT one)

```
[ MODUS WMS ]                      [ Features ]  [ Demo ]   [ EN | HR ]
```

- Left: just the wordmark, links to `/modus-wms/` (top of page).
- Right: two anchor links + language toggle.
- Becomes a translucent dark bar with `backdrop-filter: blur(14px)` after 100px of scroll.
- **No** `joe-it-solutions.com` logo. The discreet "by JOE IT Solutions" link sits in the page footer only.

---

## 11. Asset prep

| Source (`resources/wms/`) | Destination | Action |
|---|---|---|
| `device_tc57.png` | `public/modus-wms/img/device-tc57.png` | copy, rename, optimize |
| `device_rfd90.png` | `public/modus-wms/img/device-rfd90.png` | copy, rename, optimize |
| `device_bluetooth.png` | `public/modus-wms/img/device-bluetooth.png` | copy, rename, optimize |
| `orders.png` / `stock.png` / `scanner.png` / `audits.png` | (not deployed) | reference only — recreated in HTML |

The four screenshots stay in `resources/` as the visual source of truth but **don't ship**. The page renders the screens itself.

---

## 12. Routing & entry points

- The page is at `/modus-wms/` (trailing slash → Firebase serves `public/modus-wms/index.html`).
- **Entry from the main site**: `joe-it-solutions.com` → **Projects** section gets a new "Modus WMS" tile that links to `/modus-wms/`. The parent site's `index.html` and `styles.css` need a small edit to add this tile alongside the existing project cards. Image for the tile = a flat render of the recreated orders screen (same asset we'll use as the OG card, see §14.9).

---

## 13. Build / test plan

1. Stub `index.html` skeleton with all sections numbered, no animation yet. Verify content reads top-to-bottom.
2. Build the phone-frame component + the three screen recreations in static form. Tune until they look right next to the screenshots.
3. Wire i18n. Verify HR/EN toggle works on every string.
4. Wire animations one section at a time, in order S3 → S4 → S5 → S6.
5. QA on `python3 -m http.server 5173` from `/public/`.
   - Desktop Chrome / Safari / Firefox.
   - iOS Safari (touch scroll fights pinning if not careful).
   - `prefers-reduced-motion: reduce`.
   - Slow 4G throttle — make sure GSAP is the only third-party load.
6. Lighthouse pass: target 90+ on Performance and Accessibility.
7. `firebase deploy --only hosting`.

---

## 14. Decisions (locked in)

1. **CTA**: `mailto:contact@joe-it-solutions.com?subject=Modus WMS demo`. No form, no Cal.com.
2. **Wordmark**: text-only "**Modus WMS**" set in Space Grotesk 700. No logo asset.
3. **Pricing**: not on the page. Behind contact only.
4. **Integration source labels (S3)**: generic — **ERP**, **WebShop**, **Custom**. The app exposes webhooks; anything that can call a webhook can plug in. Avoid named brand logos until specific integrations actually ship.
5. **Pick guidance UI**: invented for the marketing animation, OK by user. Not present in the app yet — directionally accurate.
6. **Language default**: auto-detect via `navigator.language`. If `hr-*` → Croatian, else fall back to **EN**. User-toggled choice persists in `localStorage` and overrides the auto-detect on subsequent visits.
7. **Discoverability**: link in from the main site. The existing **Projects** section on `/index.html` gets a new tile (or row) for **Modus WMS** that links to `/modus-wms/`. This is a small follow-up on the parent site — track it as part of this work.
8. **Footer link** ("by JOE IT Solutions"): links to `https://joe-it-solutions.com/` (homepage). Single link, no contact duplication.
9. **OG/social card**: use a flat render of the recreated orders screen with the wordmark overlaid. Generated as a static PNG once the orders mockup is final, saved to `public/modus-wms/img/og.png`.

---

## 15. Risks / things to watch

- **GSAP licensing.** Free for non-club commercial use, but the SplitText / DrawSVG plugins require a paid Club license. The plan above intentionally uses only the free core + ScrollTrigger.
- **iOS Safari + `position: sticky` + pinned ScrollTrigger** historically have bad interactions. Plan: test S3 on a real iPhone first; if jittery, fall back to non-pinned `from`/`to` reveals on iOS.
- **Page weight.** GSAP + ScrollTrigger ~80 KB minified, ~35 KB gzipped. Three small device PNGs ~50 KB each after AVIF/WebP conversion. Total < 300 KB target.
- **Brand consistency vs. parent site.** The dark theme + Space Grotesk is a deliberate departure. Make sure the footer link back to `joe-it-solutions.com` is unambiguous so visitors who arrive cold understand the relationship.

---

## 16. Status

**Plan only.** No files in `public/modus-wms/` yet. Implementation kicks off in the next session, after the open questions above are answered.
