# CLAUDE.md — Marta Arpa Coaching v2

Hugo/Bigspring-Light site for Marta Arpa. Multilingual (ES/EN/FR/CA). ES is the default language and lives at the root (`/`); other languages at `/en/`, `/fr/`, `/ca/`.

---

## Running the site

```bash
npm run dev        # dev server on all interfaces (accessible on LAN)
npm run build      # production build
npm run preview    # production-mode local preview
```

Dev server is at `http://localhost:1313`. From another device on the same network use `http://[LAN-IP]:1313` — all resource URLs are root-relative so they load from any host.

---

## Project structure

```
hugo.toml                      # Main config: baseURL, theme, colors, fonts, plugins
config/_default/
  languages.toml               # ES/EN/FR/CA definitions + contentDir mapping
  params.toml                  # Logo, nav CTA, analytics, social links, metadata
  menus.{es,en,fr,ca}.toml     # Per-language nav (main) + footer menus
content/
  spanish/                     # ES content (default language)
  english/                     # EN content
  french/                      # FR content
  catalan/                     # CA content
i18n/{es,en,fr,ca}.yaml        # UI string translations (form labels, pagination, etc.)
layouts/partials/              # Theme overrides (see below)
static/images/                 # All static images served at /images/...
assets/scss/custom.scss        # Minor SCSS overrides only
```

---

## Content layout

Each language directory mirrors the same structure:

```
_index.md        # Homepage (banner + features + service rows + CTA in front matter YAML)
about.md         # About page (layout: about)
contact.md       # Contact page (layout: contact)
blog/
  _index.md      # Blog listing
  *.md           # Blog posts (3 per language, 12 total)
```

Spanish also has `privacy-policy.md` and `terms-conditions.md`.

Translations across languages are linked via `translationKey` in front matter.

---

## Adding content

### New blog post (all 4 languages)
Create one file per language with matching `translationKey`:

```yaml
---
title: "Post title"
date: "2025-MM-DDT00:00:00"
image: images/posts/folder/banner.png
summary: "One-line summary"
author: "Marta Arpa"
type: "post"
translationKey: "unique-post-slug"
---
```

Place banner images in `static/images/posts/<folder>/`.

### Homepage service row
Edit `content/{lang}/_index.md`. Each service_item requires `title`, `content`, `images` (list of paths), and optionally a `button`.

---

## Multilingual rules

- Always create content in all 4 languages (`spanish/`, `english/`, `french/`, `catalan/`)
- Use the same `translationKey` across all language versions of a page
- Menu files: `config/_default/menus.{lang}.toml`
- UI strings: `i18n/{lang}.yaml`
- Language-specific front matter labels (button text, etc.) must be translated in each `_index.md`

---

## Template overrides

Four theme/module partials are overridden in `layouts/partials/` — **do not delete these**:

| File | Why overridden |
|---|---|
| `image.html` | Changed `absURL` → `relURL` for static images (fixes cross-device loading) |
| `logo.html` | Same fix for the logo image |
| `header.html` | Navbar brand uses `"/" | relLangURL` instead of `site.BaseURL`; language switcher uses `.RelPermalink` |
| `basic-seo.html` | Suppresses `<base>` tag when `hugo.IsServer` (was injecting `//localhost:PORT/`, breaking all relative URLs) |

The root cause: Hugo dev server overrides `site.BaseURL` to `//localhost:PORT/` in templates, which breaks cross-device access. These overrides ensure all resource URLs are root-relative.

---

## Branding

- **Primary color**: `#0AA8A7` (teal)
- **Secondary color**: `#376f92` (dark blue)
- **Font**: Lato (300/400/500/600/700)
- **Font scale**: 1.25 (majorThird)
- **Dark mode**: disabled (`theme_switcher = false`)
- **Logo**: `static/images/logo-ma.webp`, rendered at 160px wide

Colors and fonts are set in `hugo.toml` under `[params.variables]` and compiled into SCSS at build time.

---

## Key config locations

| Setting | File | Key |
|---|---|---|
| Nav CTA button | `config/_default/params.toml` | `navigation_button` |
| Contact form URL | `config/_default/params.toml` | `contact_form_action` |
| Google Analytics | `hugo.toml` | `[services.googleAnalytics].ID` |
| Social links | `config/_default/params.toml` | `[params.social]` |
| Logo path/size | `config/_default/params.toml` | `logo`, `logo_width` |

---

## Pending work (from MIGRATION_PLAN.md)

- [ ] Wire up contact form action URL (`contact_form_action` in params.toml)
- [ ] Create `contact-thanks.md` in each language
- [ ] Update favicon (`static/`)
- [ ] Phase 5: Analytics (Google Analytics ID `G-25NEQK4KKL` or Umami), sticky CTA button
- [ ] Phase 6: SEO — site metadata, Schema.org JSON-LD
- [ ] Phase 8: QA — full build, link check, form test, mobile review
