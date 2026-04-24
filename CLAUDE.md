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
hugo_stats.json                # Committed — PurgeCSS reads this in CI. Do not add to .gitignore
purgecss.config.js             # PurgeCSS CLI config: extractor + JS-toggled class safelist
```

### CSS build pipeline

`npm run build` runs Hugo then immediately runs PurgeCSS CLI on `public/css/style.css`:

```
hugo ... && npx purgecss --css public/css/style.css --content hugo_stats.json --config purgecss.config.js -o public/css/
```

This reduces Font Awesome from ~2500 selectors to the ~13 actually used (396K → 76K). **Do not** re-enable `purge_css = true` in `params.toml` — the Hugo PostCSS+PurgeCSS pipe is broken for this (v6 stdin bug; the CLI path is the working fix).

If you add new classes that are toggled exclusively by JavaScript (not present in any Hugo template), add them to the `safelist` in `purgecss.config.js` so PurgeCSS doesn't strip them.

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

All 4 languages have `aviso-legal.md`, `cookie-policy.md`, `privacy-policy.md`, and `terms-conditions.md` — content is real but contains `[PLACEHOLDER]` fields (name, NIF, address, email) that Marta must fill in before go-live.

`contact-thanks.md` has `noindex: true` — it is a form-redirect utility page and must never appear in search results.

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

### CTA profile image (`assets/images/about/marpa-profile-office.png`)

**Do not replace this file with a JPEG, WebP, or any opaque format.**

The image is a 500×500 PNG with two things baked in:
1. **Transparent background** outside the circle — the circular crop is in the image, not CSS.
2. **Teal circular border** ring matching the site's primary colour (`#0AA8A7`) — also baked in, not CSS.

If you swap it for an opaque format (JPEG, etc.) both the circle shape and the border disappear and the photo renders as a plain rectangle. If you need to update the photo, recreate the circular crop + teal border in the new PNG before replacing the file. The CSS class `cta-profile-img` only handles responsive sizing; it applies no border-radius or border of its own.

---

## Multilingual rules

- Always create content in all 4 languages (`spanish/`, `english/`, `french/`, `catalan/`)
- Use the same `translationKey` across all language versions of a page
- Menu files: `config/_default/menus.{lang}.toml`
- UI strings: `i18n/{lang}.yaml`
- Language-specific front matter labels (button text, etc.) must be translated in each `_index.md`

---

## Template overrides

Six theme/module partials are overridden in `layouts/partials/` — **do not delete these**:

| File | Why overridden |
|---|---|
| `image.html` | Changed `absURL` → `relURL` for static images (fixes cross-device loading). Also handles WebP conversion + responsive `<picture>` srcsets for images in `assets/` |
| `logo.html` | Same fix for the logo image |
| `header.html` | Navbar brand uses `"/" | relLangURL` instead of `site.BaseURL`; language switcher uses `.RelPermalink` |
| `basic-seo.html` | Suppresses `<base>` tag when `hugo.IsServer`; sole source of `<title>` tag (with `meta_title` front matter support); injects Schema.org JSON-LD (`@graph` with Organization + Person + optional WebSite, BreadcrumbList on non-home pages, BlogPosting on blog singles). **Always pipe `jsonify` through `safeJS`** (`\| jsonify \| safeJS`) inside `<script>` blocks — Hugo's JS auto-escaper double-encodes quotes otherwise. |
| `head.html` | Removes the theme's own `<title>` tag — `basic-seo.html` is authoritative to avoid duplicate titles |
| `custom-script.html` | Injects Cookiebot CMP first; also manually injects GA with `data-cookieconsent="statistics"` so Cookiebot gates it. Both suppressed in dev via `hugo.IsServer`. Do not add GA back to `hugo.toml` |

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
| Google Analytics | `layouts/partials/custom-script.html` | hardcoded `G-25NEQK4KKL` in the gtag snippet — **do not add back to `hugo.toml`** |
| Social links | `config/_default/params.toml` | `[params.social]` |
| Logo path/size | `config/_default/params.toml` | `logo`, `logo_width` |

---

## Pending work (from MIGRATION_PLAN.md)

- [x] Favicon — `assets/images/favicon.png` (square MA mark, auto-resized by Hugo)
- [ ] Fill in `[PLACEHOLDER]` fields in `aviso-legal.md`, `cookie-policy.md`, `privacy-policy.md`, and `terms-conditions.md` across all 4 languages
- [x] Phase 6: SEO — metadata, canonical URLs, hreflang x-default fix, Schema.org JSON-LD (done)
- [ ] Phase 8: QA — full build, link check, form test (end-to-end submit with reCAPTCHA), mobile review
