# سما انوار الهدى | Sama Anwar Al-Huda Company

Marketing website for a general services company based in Karbala, Iraq.

Built with plain **HTML + CSS + vanilla JS** — no backend, no database, no build step. Netlify-drop ready (open from disk or deploy the folder as-is).

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Dark hero with red glow accents, services preview, red CTA band, about + contact teasers |
| Catering | `catering.html` | Service detail — التغذية |
| Cleaning | `cleaning.html` | Service detail — التنظيف |
| Transport | `transport.html` | Service detail — النقل العام |
| Fast Delivery | `delivery.html` | Service detail — التوصيل السريع |
| Workforce | `workforce.html` | Service detail — تشغيل الأيدي العاملة |
| About | `about.html` | Company story, values, location |
| Contact | `contact.html` | Phone / WhatsApp / email / address, socials, Karbala map |

Navigation, footer and service cards are shared and injected from `js/components.js` / `js/main.js` — edit copy once, it updates everywhere.

## Features

- **Bilingual (Arabic RTL / English LTR)** — `AR/EN` toggle, no reload, persisted in `localStorage` (`sah-lang`).
- **Light & dark themes** — follows `prefers-color-scheme` on first visit, override persisted (`sah-theme`).
- **Motion design** — scroll-reveal, 3D tilt-on-hover service cards (Home), scroll progress bar, cursor glow (desktop), animated WhatsApp pulse, honours `prefers-reduced-motion`.

## Project structure

```
.
├── index.html            # Home (hero + all sections)
├── catering.html         # Service pages (5)
├── cleaning.html
├── transport.html
├── delivery.html
├── workforce.html
├── about.html            # About + values
├── contact.html          # Contact + map
├── css/
│   └── style.css         # Tokens, themes, RTL/LTR, animations, responsive
├── js/
│   ├── translations.js   # I18N dictionary (ar / en)
│   ├── components.js     # Shared header/footer injection
│   ├── main.js           # Boot: theme/lang, cards, reveals, tilt, events
└── assets/
    └── logo/
        └── logo.jpg      # Real logo (your supplied photo)
```

## About the Home hero

- The hero is a full-screen dark stage with red radial glows and a glowing red horizon line — the brand identity carries the visual weight (no heavy 3D/WebGL code, loads instantly anywhere).

## Deploy to Netlify

### Option 1 — Drag & drop

1. Go to https://app.netlify.com/drop
2. Drag this entire folder into the drop zone.
3. Site is live immediately at a random `*.netlify.app` URL.

### Option 2 — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.
```

### Option 3 — Git + Netlify

1. Push this folder to a Git repository.
2. Netlify → **Add new site → Import an existing project**.
3. Leave **Build command** empty and set **Publish directory** to `.`.
4. Deploy.

## Customisation notes

- All copy lives in the `I18N` object in `js/translations.js` — edit `ar` / `en` values there.
- Brand colours are CSS variables at the top of `css/style.css` (`:root` for light, `[data-theme="dark"]` for dark). Identity: black `#111111`, white `#FFFFFF`, red `#C21E2C`.
- Company contact details (phone `0782 586 5514`, WhatsApp, email, socials, map query) appear as plain links in `index.html`, `contact.html`, `js/components.js` and `js/translations.js`.
- **Real logo**: the site uses the photo you supplied — copied to `assets/logo/logo.jpg` and referenced everywhere (favicon, navbar, footer, preloader).