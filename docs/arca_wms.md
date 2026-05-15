# ARCA WMS — product page plan

A standalone, scroll-driven product page for **ARCA WMS**, a customizable warehouse-management system built on Flutter / Serverpod (source: `~/ServerpodProjects/dmr/`).

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
| Markup | `public/arca-wms/index.html` |
| Styling | `public/arca-wms/styles.css` (dark theme, Space Grotesk, scoped — no leakage from `/styles.css`) |
| Interactivity | `public/arca-wms/main.js` (vanilla JS) |
| Scroll animations | **GSAP + ScrollTrigger** via jsdelivr CDN (~35 KB gzipped) |
| Font | **Space Grotesk** via Google Fonts (matches the Flutter app exactly) |
| Icons | Inline SVG (recreate the bottom-nav icons + package, scanner, truck, etc.) |
| i18n | Plain `data-i18n` attributes + JS string table; toggle persists in `localStorage` |

Why GSAP+ScrollTrigger and not native CSS scroll-driven animations: choreography is non-trivial (pin a section, scrub multiple element timelines together, snap between steps). CSS `animation-timeline: scroll()` is close, but `view-timeline` Safari support is still spotty in 2026; GSAP handles all browsers and gives us a real timeline we can author. We keep the rest of the parent site framework-free.

Loaded once at the bottom of `<body>`:
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="/arca-wms/main.js" defer></script>
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
├── arca-wms/
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

The page is one long scroll. Steps inside the Picking module use GSAP `ScrollTrigger`. The modules section uses a sticky tab rail that updates the active tab as you scroll.

### S1. Hero ✅
- Centered wordmark `ARCA WMS`, tagline, subline, two CTAs (primary + ghost).
- Background: radial gradient in `--accent` at ~6% opacity + floating SVG specks.
- Bouncing scroll-cue chevron at the bottom.

### S2. Pitch ✅
- Headline: *"Most WMS make you adapt your warehouse. ARCA WMS adapts to you."*
- Three bullets: Custom fields, Automations, Configurable picking — each fades in on scroll.

### Modules section ✅

A `.mw-modules` wrapper that contains a **sticky tab rail** (`position: sticky; top: 60px`) and four module sections below it.

**Tab rail** — four tabs, each with an inline SVG icon + label:
- Picking (truck icon)
- Receiving (box-stack icon)
- Audits (clipboard icon)
- Automations (lightning bolt icon)

Active tab is highlighted in `--accent` with a 2px bottom border. ScrollTrigger updates the active tab as each module scrolls into view. Tab clicks smooth-scroll to the correct module with a `60 + 50 px` offset (nav + rail height).

**Module header format** — all four modules use the same compact header:
```
[icon] LABEL NAME      ← .mw-module__label: yellow, 0.8rem, uppercase, 0.08em tracking
Short lede sentence.   ← .mw-module__lede: --text-muted, 1rem
```
No h2 title — the icon + label from the tab rail is the only heading. Padding: `1.5rem 4rem 1rem`.

#### Module 1: Picking ✅ (fully animated)

Four scroll steps (`scroll-margin-top: 110px` on the module, `3.5rem 4rem` padding per step):

- **Step 01 — Order arrives**: source tiles (ERP / WebShop / Custom), animated packet arc SVG → new order slides into the phone orders list.
- **Step 02 — Scan & pick**: camera viewfinder with scan line, barcode box floats in, pick-card shows location + item + progress bar. Device cards row (Camera / Zebra TC57 / RFID / Bluetooth / USB / Manual).
- **Step 03 — Confirm & ship**: ship screen with address typing animation, yellow OTPREMI button pulse, paper-plane SVG launch.
- **Step 04 — Stock updates**: stock list with animated quantity decrement on the shipped item.

A vertical step-dot indicator (`position: fixed; left: 2rem`) shows which step is active inside the Picking module. Hidden on mobile.

#### Module 2: Receiving ✅ (fully animated)

Three scroll steps (`scroll-margin-top: 110px` on the module, same padding pattern as Picking):

- **Step 01 — Scan inbound stock**: scanner screen (reuses `.mw-scanner-screen` from Picking) with viewfinder, scan line, barcode box for `INOX-TRUSS-14mm`. Below: a **put-away guidance card** (`.mw-putaway-card`, teal/blue accent `#0D4B5A` to distinguish from Picking’s yellow) showing destination: “Zona C › Polica D-2” + item + quantity.
- **Step 02 — No barcode? Print one.**: phone showing a print-label UI (item name, SKU, barcode preview, yellow 🖨 PRINT button) + handheld barcode printer SVG illustration side-by-side (`.mw-print-pair`). Wireless signal arcs (`.mw-wireless-signal`) animate from phone → printer. Label (`.mw-printer-label`) slides out of the printer slot. Phone + printer stay side-by-side on mobile too (scaled down).
- **Step 03 — Scan the shelf**: scanner screen scanning a **QR code** (`.mw-shelf-qr`) with “Polica D-2” text below, sitting on a subtle shelf surface illustration (`.mw-shelf-surface`). After scan: green confirmation card (`.mw-assign-card`, `#1a3a1a` bg, `#00AA44` border) showing “✓ ASSIGNED — INOX-TRUSS-14mm → Zone C › Shelf D-2”.

A separate 3-dot step indicator (`#mw-recv-step-indicator`) shows which step is active inside the Receiving module. Hidden on mobile.

Phone bottom nav: active icon is a 3D box/package (distinct from Picking’s truck). Active label: “Prijem”.

#### Module 3: Audits ✅ (fully animated)

Two scroll steps (`scroll-margin-top: 110px` on the module, same padding pattern as Picking/Receiving):

- **Step 01 — Walk the warehouse, scan what's there**: scanner screen (reuses `.mw-scanner-screen` from Picking/Receiving) with viewfinder and animated scan line. Inside the viewfinder, three smaller `.mw-barcode-mini` boxes are stacked vertically (one per audited SKU: `INOX-TRUSS-14mm`, `BOLT-M8-50mm`, `WASHER-12mm`). On enter, the three barcodes drift in stacked with a stagger; then a green check (`.mw-barcode-mini__check`) sweeps top → middle → bottom in sequence, as if the auditor is ticking each item off the list.
- **Step 02 — See the differences in one glance**: a new `.mw-audit-summary` screen inside the same phone frame. Header eyebrow `INVENTURA — REZULTATI` with a small location row beneath it (`.mw-audit-summary__warehouse`, purple pin icon + "Warehouse Sisak" / "Skladište Sisak") so the audit is anchored to a specific site. Below it, a circular SVG progress ring (`.mw-audit-progress`, purple `#A78BFA` stroke) animates from 0% → **84%** via `stroke-dashoffset`, with a synced numeric counter inside the ring. Below the ring, large `1240 / 1476` counts plus a `counted / expected` sublabel. Then a list of five `.mw-audit-row` cards (purple left stripe) showing variances:
  - `INOX-TRUSS-14mm` — `2 / 3` (counted/expected, count rendered in red `#FFB4AB`)
  - `BOLT-M8-50mm` — `4 / 3` with a yellow **`+1 EXTRA`** badge that pops in via `back.out(2.4)`
  - `WASHER-12mm` — `5 / 6` (count in red)
  - `HEX-NUT-M10` — `18 / 20` (count in red)
  - `PLATE-ZINC-A4` — `7 / 5` with a yellow **`+2 EXTRA`** badge (staggered after the first badge)

A separate 2-dot step indicator (`#mw-audit-step-indicator`) shows which step is active inside the Audits module. Hidden on mobile.

Phone bottom nav: active icon is the clipboard icon (matches the tab-rail audits icon, distinct from Picking's truck and Receiving's package). Active label: "Inventura".

#### Module 4: Automations ✅ (fully animated)

Three scroll steps (same structure as Picking/Receiving/Audits):

- **Step 01 — Configure your warehouse**: desktop screen showing a 3-column Finder-style browser (Warehouse › Zone › Shelf). Columns cascade in with stagger; a detail panel slides up showing custom-field chips.
- **Step 02 — Configure your catalog**: desktop screen with four iOS-style toggles (decimals, restock, lot-tracking, serial-tracking). Two toggles flip on as scroll triggers; a new `Datum isteka (Datum)` custom-field row slides into the list.
- **Step 03 — Automations editor**: desktop split-pane — left: trigger summary card (`Stock.Adjusted`, status active); right: code editor that reveals lines in stagger (typewriter feel), ending with a `✓ 200 OK — synced to ERP` toast.

All three steps use `.mw-desktop` (new component: window chrome + 14px radius bezel). Module accent: `#00E5A0` (mint/green). Lot/serial tracking toggles are directionally accurate (same precedent as the Picking module's invented pick-guidance UI — decision #5).

### Features grid ✅
Six tiles: Audits, Receiving, Transfers, Automations, Custom fields, Multi-warehouse.

### CTA ✅
*"Make ARCA WMS yours."* + `mailto:` button.

### Footer ✅
Copyright, "By JOE IT Solutions" link, EN/HR toggle.

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
[ ARCA WMS ]                      [ Features ]  [ Demo ]   [ EN | HR ]
```

- Left: logo mark + two-tone wordmark, links to `/arca-wms/` (top of page).
- Right: two anchor links + language toggle.
- Becomes a translucent dark bar with `backdrop-filter: blur(14px)` after 100px of scroll.
- **No** `joe-it-solutions.com` logo. The discreet "by JOE IT Solutions" link sits in the page footer only.

---

## 11. Asset prep

| Source (`resources/wms/`) | Destination | Action |
|---|---|---|
| `device_tc57.png` | `public/arca-wms/img/device-tc57.png` | copy, rename, optimize |
| `device_rfd90.png` | `public/arca-wms/img/device-rfd90.png` | copy, rename, optimize |
| `device_bluetooth.png` | `public/arca-wms/img/device-bluetooth.png` | copy, rename, optimize |
| `orders.png` / `stock.png` / `scanner.png` / `audits.png` | (not deployed) | reference only — recreated in HTML |

The four screenshots stay in `resources/` as the visual source of truth but **don't ship**. The page renders the screens itself.

---

## 12. Routing & entry points

- The page is at `/arca-wms/` (trailing slash → Firebase serves `public/arca-wms/index.html`).
- **Entry from the main site**: `joe-it-solutions.com` → **Projects** section gets a new "ARCA WMS" tile that links to `/arca-wms/`. The parent site's `index.html` and `styles.css` need a small edit to add this tile alongside the existing project cards. Image for the tile = a flat render of the recreated orders screen (same asset we'll use as the OG card, see §14.9).

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

1. **CTA**: `mailto:contact@joe-it-solutions.com?subject=ARCA WMS demo`. No form, no Cal.com.
2. **Wordmark**: SVG logo mark (134×78 viewBox, `arca_logo.svg`) on the left + two-tone text on the right — "ARCA" Space Grotesk 700 in `--accent` (#FFB300), "WMS" 500 in `--text-muted`. External file at `public/arca-wms/img/logo.svg`.
3. **Pricing**: not on the page. Behind contact only.
4. **Integration source labels (S3)**: generic — **ERP**, **WebShop**, **Custom**. The app exposes webhooks; anything that can call a webhook can plug in. Avoid named brand logos until specific integrations actually ship.
5. **Pick guidance UI**: invented for the marketing animation, OK by user. Not present in the app yet — directionally accurate.
6. **Language default**: auto-detect via `navigator.language`. If `hr-*` → Croatian, else fall back to **EN**. User-toggled choice persists in `localStorage` and overrides the auto-detect on subsequent visits.
7. **Discoverability**: link in from the main site. The existing **Projects** section on `/index.html` gets a new tile (or row) for **ARCA WMS** that links to `/arca-wms/`. This is a small follow-up on the parent site — track it as part of this work.
8. **Footer link** ("by JOE IT Solutions"): links to `https://joe-it-solutions.com/` (homepage). Single link, no contact duplication.
9. **OG/social card**: use a flat render of the recreated orders screen with the wordmark overlaid. Generated as a static PNG once the orders mockup is final, saved to `public/arca-wms/img/og.png`.

---

## 15. Risks / things to watch

- **GSAP licensing.** Free for non-club commercial use, but the SplitText / DrawSVG plugins require a paid Club license. The plan above intentionally uses only the free core + ScrollTrigger.
- **iOS Safari + `position: sticky` + pinned ScrollTrigger** historically have bad interactions. Plan: test S3 on a real iPhone first; if jittery, fall back to non-pinned `from`/`to` reveals on iOS.
- **Page weight.** GSAP + ScrollTrigger ~80 KB minified, ~35 KB gzipped. Three small device PNGs ~50 KB each after AVIF/WebP conversion. Total < 300 KB target.
- **Brand consistency vs. parent site.** The dark theme + Space Grotesk is a deliberate departure. Make sure the footer link back to `joe-it-solutions.com` is unambiguous so visitors who arrive cold understand the relationship.

---

## 16. Status

**Live / in progress.**

| Area | State |
|---|---|
| Hero, Pitch, CTA, Footer | ✅ Done |
| Modules sticky tab rail | ✅ Done |
| Module 1 — Picking (4 scroll steps + GSAP animations) | ✅ Done |
| Module 2 — Receiving (3 scroll steps + GSAP animations) | ✅ Done |
| Module 3 — Audits (2 scroll steps + GSAP animations) | ✅ Done |
| Module 4 — Automations (3 scroll steps + GSAP animations) | ✅ Done |
| Features grid | ✅ Done |
| i18n (EN + HR) | ✅ Done |
| Mobile responsive | ✅ Done (tabs scroll horizontally, step dots hidden, single-col steps) |
| Firebase deploy | ✅ Deployed (`firebase.json` already points to `public/`) |
