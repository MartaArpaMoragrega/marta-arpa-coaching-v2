# Marta Arpa Coaching & Consultancy — Website

Hugo site for [martaarpa.com](https://martaarpa.com). Multilingual: ES (default), EN, FR, CA.

## Local development

```bash
npm install       # first time only
npm run dev       # dev server at http://localhost:1313
npm run build     # production build (runs Hugo + PurgeCSS)
npm run preview   # serve the production build locally
```

Accessible on LAN at `http://[LAN-IP]:1313` — all URLs are root-relative.

## Content structure

```
content/spanish/    # ES — default language, served at /
content/english/    # EN — served at /en/
content/french/     # FR — served at /fr/
content/catalan/    # CA — served at /ca/
```

Each language mirrors the same layout: `_index.md` (homepage), `about.md`, `contact.md`, `blog/*.md`.

Always create content in all 4 languages with a matching `translationKey` in front matter.

## Key config

| What | File | Key |
|---|---|---|
| Booking URL (all CTAs) | `config/_default/params.toml` | `navigation_button.link` |
| Contact form endpoint | `config/_default/params.toml` | `contact_form_action` |
| Nav menus | `config/_default/menus.{es,en,fr,ca}.toml` | — |
| UI strings | `i18n/{es,en,fr,ca}.yaml` | — |

## Images

- Blog banners → `assets/images/posts/<slug>/banner.png` (Hugo generates WebP + srcsets)
- Service images → `assets/images/services/` (square PNG, 512×512)
- Static images (logo, about) → `static/images/`

## Theme

Based on [Bigspring Light](https://github.com/themefisher/bigspring-light-hugo) (MIT).
Partials overridden in `layouts/partials/` — see `CLAUDE.md` for details.
