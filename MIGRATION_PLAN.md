# Migration Plan: marta-arpa-coaching → marta-arpa-coachinv-v2

**Goal**: Migrate all content from the Hugo/Arcana site into the Hugo/Bigspring-Light template, producing a stylish landing page with Blog, Contact, and full multilanguage support (ES/EN/FR/CA). Keep the template's branding (colors, fonts, design system) as-is. Services are homepage sections, not separate pages.

---

## Open Decisions

- [x] **Pricing page**: Delete.
- [x] **FAQ page**: Delete.
- [x] **German language**: Delete (replacing with ES+EN+FR+CA).
- [x] **Dark mode**: Disable — remove theme switcher.
- [x] **Newsletter page**: Not migrated (confirmed decision).
- [x] **Contact Thanks page**: Created in all 4 languages.
- [ ] **Analytics**: Source uses Google Analytics (`G-25NEQK4KKL`) + Umami. Confirm which to keep (deferred to Phase 5).

---

## Phase 1 — Foundation & Cleanup

### 1.1 Remove demo/placeholder content
- [x] Delete `content/english/blog/*.md` (8 lorem ipsum posts — keep only `_index.md`)
- [x] Delete `content/deutsch/` directory entirely (replacing with ES/FR/CA)
- [x] Delete `content/english/pricing.md`
- [x] Delete `content/english/faq/`
- [x] Disable dark mode: set `theme_switcher = false` in `params.toml`

### 1.2 Restructure language directories
- [x] Rename `content/english/` → `content/spanish/` (will be the default/ES content)
- [x] Create `content/english/`, `content/french/`, `content/catalan/`

### 1.3 Update `config/_default/languages.toml`
- [x] Replace EN+DE definitions with ES+EN+FR+CA
- [x] Set `defaultContentLanguage = "es"` and `defaultContentLanguageInSubdir = false` in `hugo.toml`

### 1.4 Update menu files
- [x] `menus.es.toml` — Inicio | Servicios | Sobre mí | Blog | Contacto
- [x] `menus.en.toml`, `menus.fr.toml`, `menus.ca.toml` with translated labels

### 1.5 Update i18n strings
- [x] Created `i18n/es.yaml`, `en.yaml`, `fr.yaml`, `ca.yaml` with all theme keys translated

---

## Phase 2 — Branding: Logo Only

Template colors, fonts, and design system are kept as-is (teal `#0AA8A7`, Lato, Bootstrap grid).

- [x] Copy `logo-ma-bottom.webp` from source → `static/images/logo-ma.webp`
- [x] Update `params.toml`: `logo`, `logo_webp`, `logo_width`, `logo_text`, `theme_switcher = false`
- [ ] Update favicon in `static/`

---

## Phase 3 — Homepage Content

The target homepage is driven by front matter YAML in `content/{lang}/_index.md`.

### 3.1 Spanish homepage (`content/spanish/_index.md`)
Map source `data/homepage.yml` blocks to Bigspring front matter structure. Services live here as alternating rows — no separate service pages.

- [x] Banner, Feature (6 cards), Service (4 rows), CTA — all 4 language homepages written
- [x] `content/spanish/_index.md`, `content/english/_index.md`, `content/french/_index.md`, `content/catalan/_index.md`

---

## Phase 4 — Inner Pages

### 4.1 About page
- [x] `content/spanish/about.md`, `english/about.md`, `french/about.md`, `catalan/about.md`

> **Note**: Separate service detail pages are NOT part of this migration.

### 4.2 Blog posts (3 posts × 4 languages = 12 files)
- [x] All 12 blog post files written across ES/EN/FR/CA

### 4.3 Contact page
- [x] `content/spanish/contact.md` and all language variants written
- [x] Wire up un-static.com form action URL in `params.toml` (`contact_form_action`)
- [x] Create `contact-thanks.md` in each language (post-submission redirect)
- [x] reCAPTCHA v2 integrated in contact layout override (`layouts/_default/contact.html`)

---

## Phase 5 — Layout Overrides & Integrations _(postponed)_

> Deferred — tackle after core content is in place.

- [x] Sticky CTA button: not doing (confirmed decision).
- [ ] Header navigation CTA button label + URL ("Reserva sesión" → Brevo)
- [ ] Language switcher: verify all 4 languages render correctly
- [x] Analytics: Google Analytics `G-25NEQK4KKL` set in `hugo.toml`
- [x] Analytics: Umami Cloud added (`6d411740-d616-4e37-875f-35102dd154c6`), cookieless, `data-cookieconsent="ignore"`
- [x] Cookiebot CBid `74620d63-7852-407b-b5c4-4c336038f057` set in `layouts/partials/custom-script.html`
- [x] Cookiebot: reCAPTCHA script tagged `data-cookieconsent="ignore"` — never blocked by auto-blocking

---

## Phase 6 — SEO & Meta _(postponed)_

> Deferred — tackle after core content is in place.

- [x] Update `hugo.toml`: `baseURL = "https://martaarpa.com"`
- [x] Update `params.toml`: metadata description, author, image, keywords, copyright, social links
- [x] hreflang tags for ES/EN/FR/CA + x-default (x-default fixed to always point to ES)
- [x] Canonical URLs (auto-generated from `.Permalink`)
- [x] Schema.org JSON-LD (Organization on all pages, BlogPosting on blog posts)

---

## Phase 7 — Assets & Images

- [x] Banner hero (`images/homepage/banner-new.webp`)
- [x] Service row images (`images/services/coaching-ex.png`, `coaching-per.png`, `maas.png`, `consultancy.png`)
- [x] Profile photo (`images/about/marpa-profile-office.jpg`)
- [x] Blog post banners (`images/posts/*/banner*.png`)
- [x] Logo (`images/logo-ma.webp`)
- [ ] Update favicon in `static/`

---

## Phase 8 — QA & Polish

- [ ] Build and review all 4 language versions locally (`hugo server`)
- [ ] Check all internal links resolve correctly across languages
- [ ] Test contact form submission and redirect
- [ ] Mobile/responsive review (Bootstrap grid)
- [ ] Performance: confirm PurgeCSS removes unused Bootstrap CSS

---

## File Reference

| File | Purpose |
|---|---|
| `hugo.toml` | Colors, fonts, pagination, analytics |
| `config/_default/languages.toml` | Language definitions (ES/EN/FR/CA) |
| `config/_default/params.toml` | Nav CTA, preloader, social, metadata |
| `config/_default/menus.{lang}.toml` | Per-language nav + footer menus |
| `assets/scss/custom.scss` | Minor overrides only (logo tweak if needed) |
| `i18n/{lang}.yaml` | UI string translations |
| `content/{lang}/_index.md` | Homepage front matter content (incl. service rows) |

---

## Source Reference Paths

| What | Where in source |
|---|---|
| Homepage data | `data/homepage.yml`, `data/en/`, `data/fr/`, `data/ca/` |
| Service content | `content/services/*/main.html` + language variants |
| About content | `content/about/*/main.html` + language variants |
| Blog posts | `content/posts/*.md` |
| SCSS components | `assets/sass/_*.scss` |
| i18n strings | `i18n/es.toml`, `en.toml`, `fr.toml`, `ca.toml` |
| Scroll/CTA JS | `layouts/partials/scripts.html` |
| Images | `static/images/` |
