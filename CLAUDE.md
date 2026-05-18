# joe-it repo

## Sites overview

This repo hosts two separate websites under one Firebase project (`joe-it-solutions`).

| Site | Folder | Live URL | Firebase site ID |
|------|--------|----------|-----------------|
| JOE IT Solutions (portfolio) | `public/` | https://joe-it-solutions.com | `joe-it-solutions` |
| Arca WMS (product) | `arca-wms/` | https://arca-wms.com | `arca-wms-joe-it` |

Firebase multi-site hosting is configured in `firebase.json` (two targets) and `.firebaserc` (target → site ID mapping).

The joe-it portfolio at `/arca-wms` and `/arca-wms/**` redirects 301 to https://arca-wms.com.

## Deploying

Deploy both sites at once:
```
firebase deploy --only hosting
```

Deploy only the portfolio site:
```
firebase deploy --only hosting:joe-it
```

Deploy only the Arca WMS site:
```
firebase deploy --only hosting:arca-wms
```

## Arca WMS site

- Source: `arca-wms/`
- Assets use root-relative paths (`/styles.css`, `/main.js`, `/img/...`) since the folder is served from the domain root
- Contact email: contact@arca-wms.com
- i18n (EN/HR) handled by `arca-wms/i18n.js`
- Footer links back to joe-it-solutions.com

## JOE IT Solutions portfolio

- Source: `public/`
- Contact email: contact@joe-it-solutions.com
- Project card for Arca WMS links to https://arca-wms.com (external, new tab)
