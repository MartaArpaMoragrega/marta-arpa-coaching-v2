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
static/images/                 # Static images (banner, about, posts, logo) served at /images/...
assets/images/services/        # Service section images — processed by Hugo (auto WebP + responsive srcsets)
assets/scss/custom.scss        # Minor SCSS overrides only
```

---

## Content layout

Each language directory mirrors the same structure:

```
_index.md           # Homepage (banner + features + service rows + CTA in front matter YAML)
about.md            # About page (layout: about)
contact.md          # Contact page (layout: contact)
contact-thanks.md   # Post-form redirect page (default single layout)
blog/
  _index.md         # Blog listing
  *.md              # Blog posts (3 per language, 12 total)
```

Spanish also has `privacy-policy.md` and `terms-conditions.md` (Lorem ipsum — not yet live).

All 4 languages have `aviso-legal.md` and `cookie-policy.md` — content is real but contains `[PLACEHOLDER]` fields (name, NIF, address, email, domain) that Marta must fill in before go-live.

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

Place service images in `assets/images/services/` (not `static/`) — Hugo will automatically generate WebP versions and responsive srcsets at build time. Source images should be square PNG at 512×512.

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
| `image.html` | Changed `absURL` → `relURL` for static images (fixes cross-device loading). Also handles WebP conversion + responsive `<picture>` srcsets for images in `assets/` |
| `logo.html` | Same fix for the logo image |
| `header.html` | Navbar brand uses `"/" | relLangURL` instead of `site.BaseURL`; language switcher uses `.RelPermalink` |
| `basic-seo.html` | Suppresses `<base>` tag when `hugo.IsServer` (was injecting `//localhost:PORT/`, breaking all relative URLs) |
| `custom-script.html` | Injects Cookiebot CMP script as the first `<head>` script so it can block GA and other cookies until consent is given |

One layout is overridden in `layouts/_default/`:

| File | Why overridden |
|---|---|
| `contact.html` | Adds hidden `_redirect` field (language-aware thanks page via `absLangURL`), reCAPTCHA v2 widget, and reCAPTCHA API script |

The root cause: Hugo dev server overrides `site.BaseURL` to `//localhost:PORT/` in templates, which breaks cross-device access. These overrides ensure all resource URLs are root-relative.

---

## Branding

- **Primary color**: `#0AA8A7` (teal)
- **Secondary color**: `#376f92` (dark blue)
- **Font**: Lato (300/400/500/600/700)
- **Font scale**: 1.25 (majorThird) — `font_scale` in `hugo.toml` compiles to a SCSS variable that is never used; heading sizes are hardcoded in px in the theme. Changing `font_scale` has no effect.
- **Dark mode**: disabled (`theme_switcher = false`)
- **Logo**: `static/images/logo-ma.webp`, rendered at 160px wide

Colors and fonts are set in `hugo.toml` under `[params.variables]` and compiled into SCSS at build time.

---

## Key config locations

| Setting | File | Key |
|---|---|---|
| Booking URL — **all CTAs site-wide** (nav button, banner, homepage CTA, contact page) | `config/_default/params.toml` | `navigation_button.link` |
| Nav CTA button label | `config/_default/params.toml` | `navigation_button.label` |
| Contact form URL | `config/_default/params.toml` | `contact_form_action` |
| reCAPTCHA site key | `config/_default/params.toml` | `recaptcha_site_key` |
| Google Analytics | `hugo.toml` | `[services.googleAnalytics].ID` |
| Social links | `config/_default/params.toml` | `[params.social]` |
| Logo path/size | `config/_default/params.toml` | `logo`, `logo_width` |

---

## Pending work (from MIGRATION_PLAN.md)

- [x] Favicon — `assets/images/favicon.png` (square MA mark, auto-resized by Hugo)
- [ ] Fill in `[PLACEHOLDER]` fields in `aviso-legal.md` and `cookie-policy.md` across all 4 languages
- [x] Phase 6: SEO — metadata, canonical URLs, hreflang x-default fix, Schema.org JSON-LD (done)
- [ ] Phase 8: QA — full build, link check, form test (end-to-end submit with reCAPTCHA), mobile review
