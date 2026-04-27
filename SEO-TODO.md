# SEO Action Plan

Audit date: 2026-04-26 | Score: 58/100 | Full report: run `/seo audit https://martaarpa.com`

Items are ordered by priority. Check off each one as it's done.

---

## CRITICAL — Pre-launch blockers

- [ ] **Fill placeholder fields in all 16 legal files**
  Affects: `aviso-legal.md`, `cookie-policy.md`, `privacy-policy.md`, `terms-conditions.md`
  in `content/spanish/`, `content/english/`, `content/french/`, `content/catalan/`
  Fields to fill: name, NIF, address, email

- [x] **Verify booking URL** — open `https://meet.brevo.com/marta-arpa/sesion-gratuita-` in a browser
  and confirm it resolves (trailing hyphen in `config/_default/params.toml` `navigation_button.link`
  may be an incomplete slug)

- [x] **Create `static/robots.txt`** — currently returns 404, no sitemap declaration, no AI crawler guidance
  ```
  User-agent: *
  Allow: /

  User-agent: GPTBot
  Allow: /

  User-agent: OAI-SearchBot
  Allow: /

  User-agent: ClaudeBot
  Allow: /

  User-agent: PerplexityBot
  Allow: /

  Sitemap: https://martaarpa.com/sitemap.xml
  ```

---

## HIGH — Code fixes (1–3 hours total)

- [x] **Add keyword `meta_title` to all 4 homepage `_index.md` files**
  `content/spanish/_index.md` → `meta_title: "Coach Ejecutiva en Barcelona | Marta Arpa Coaching"`
  `content/english/_index.md` → `meta_title: "Executive Coach Barcelona, Spain | Marta Arpa"`
  `content/french/_index.md`  → `meta_title: "Coach Exécutive à Barcelone | Marta Arpa Coaching"`
  `content/catalan/_index.md` → `meta_title: "Coach Executiva a Barcelona | Marta Arpa Coaching"`

- [x] **Fix `og:type` for blog posts** — hardcoded `"website"` on all pages including blog posts
  File: `layouts/partials/basic-seo.html` line 161
  Replace: `<meta property="og:type" content="website" />`
  With:
  ```html
  <meta property="og:type" content="{{ if and (.Section) (eq .Section "blog") (not .IsSection) }}article{{ else }}website{{ end }}" />
  ```

- [x] **Fix `Person.image` → wrap in `ImageObject`**
  File: `layouts/partials/basic-seo.html` line 206
  Replace bare string URL with:
  ```json
  "image": {
    "@type": "ImageObject",
    "url": "https://martaarpa.com/images/about/marpa-profile-office-original.jpg",
    "width": 500,
    "height": 500
  },
  ```

- [x] **Fix `WebSite` schema `@id` language bug**
  File: `layouts/partials/basic-seo.html` lines 221–223
  `site.Home.Permalink` evaluates to `/en/#website` on the EN homepage — creates two inconsistent WebSite entities.
  Replace with `$siteID` (already defined earlier in the template):
  ```go-html-template
  "@id": "{{ $siteID }}/#website",
  "url": "{{ $siteID }}/",
  ```

- [x] **Upgrade `Person.jobTitle` and add `knowsAbout` + `areaServed`**
  File: `layouts/partials/basic-seo.html` line 203
  - Change `"jobTitle": "Coach"` → `"jobTitle": "Executive Coach & Change Consultant"`
  - Add after `"sameAs"`:
    ```json
    "areaServed": ["Spain", "Europe"],
    "knowsAbout": ["executive coaching", "team coaching", "change management", "organizational consulting", "positive leadership"]
    ```
  - Add `"hasCredential"` if Marta holds an ICF/AECOP certification

- [x] **Add `ProfilePage` schema to the About page**
  File: `layouts/partials/basic-seo.html` — add a new `<script>` block, conditional on `eq .Layout "about"`:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": "{{ .Permalink }}#profilepage",
    "url": "{{ .Permalink }}",
    "about": { "@id": "{{ $siteID }}/#person" },
    "mainEntity": { "@id": "{{ $siteID }}/#person" }
  }
  ```

- [x] **Create `static/llms.txt`** — declares canonical content to AI ingestion pipelines
  ```markdown
  # Marta Arpa Coaching & Consultancy
  > Executive coach and change consultant. 15+ years in organizational transformation.

  ## About
  - [About Marta Arpa](https://martaarpa.com/about/)

  ## Services
  - [Executive Coaching](https://martaarpa.com/)
  - [Team Coaching](https://martaarpa.com/)
  - [Change Consulting](https://martaarpa.com/)

  ## Blog
  - [Positive Leadership](https://martaarpa.com/blog/liderazgo-positivo/)
  - [Impostor Syndrome](https://martaarpa.com/blog/sindrome-de-la-impostora/)
  - [Transforming is not Changing Place](https://martaarpa.com/blog/transformar-no-es-cambiar-de-lugar/)
  ```

- [x] **Optimize blog post banner images** — blog banners live in `static/images/posts/` and bypass Hugo's
  image pipeline; worst case is `sindrome-de-la-impostora/banner.png` at 904 KB.
  Convert all post banners to WebP at ≤100 KB, then update each post's `image:` front matter.
  Quick conversion: `cwebp -q 80 <input>.png -o <output>.webp`

- [x] **Add headshot as OG image for homepages**
  Add to each language's `_index.md` front matter:
  `meta_image: "images/about/marpa-profile-office-original.jpg"`
  (Current fallback is the site logo, which makes a poor social preview)

---

## MEDIUM — hugo.toml and config tweaks

- [x] **Enable `enableGitInfo = true` in `hugo.toml`**
  Automatically sets `.Lastmod` from last git commit date, fixing `BlogPosting.dateModified`
  always equalling `datePublished`

- [x] **Disable taxonomy index pages** — `categories/` and `tags/` pages are auto-generated,
  content-free, and currently in all 4 language sitemaps.
  Add to `hugo.toml`:
  ```toml
  disableKinds = ["taxonomy", "term"]
  ```

- [x] **Fix multilingual OG/meta description fallback**
  `params.toml` `[metadata] description` is Spanish-only; EN/FR/CA pages without explicit
  `description` front matter serve Spanish metadata. Add translated `description:` to each
  language's `_index.md` front matter (and `about.md`).

- [x] **Add `lastmod` front matter to static pages missing it** — resolved by `enableGitInfo = true`; Hugo now pulls lastmod from git history automatically.

- [ ] **Submit sitemap to Google Search Console**
  Submit `https://martaarpa.com/sitemap.xml` manually in GSC to accelerate indexation.
  Also verify the property if not already done.

- [x] **Add location to EN homepage hero**
  `content/english/_index.md` — add "Barcelona, Spain" to the banner `content:` field
  or the H1. EN homepage has zero geographic signal for "executive coach Barcelona/Spain" searches.

---

## CONTENT — About page & blog depth (highest SEO leverage after code fixes)

- [ ] **Deepen the About page** (~230 words now; target 500+)
  Add to `content/spanish/about.md` (and translate to EN/FR/CA):
  - A direct-answer opening paragraph: "Marta Arpa es coach ejecutiva y consultora del cambio,
    con base en el Maresme (Barcelona)…"
  - Named certification or accreditation (ICF level, AECOP, coaching school)
  - Educational background
  - Types of organizations/industries worked with
  - Named methodologies (systemic coaching, agile, etc.)

- [ ] **Add internal links to the 3 existing orphan blog posts** (30-minute fix)
  - `blog/liderazgo-positivo.md` — add a link to the Coaching Ejecutivo service section
  - `blog/sindrome-de-la-impostora.md` — add a link to Plan de Carrera or Coaching Ejecutivo
  - `blog/transformar-no-es-cambiar-de-lugar.md` — add a CTA linking to Consultoría del Cambio

- [ ] **Expand all 12 blog posts from ~350 avg → 1,200–1,500 words**
  Each post needs: named research citations, at least one first-hand coaching example
  (anonymized), H3 subheadings as questions, and a closing CTA to the relevant service.
  Priority order: transformar > liderazgo-positivo > sindrome-de-la-impostora
  (repeat for EN/FR/CA equivalents)

- [ ] **Add at least one statistic with source to each blog post**
  Examples:
  - Impostor syndrome: Clance & Imes (1978), "70% of people experience it at some point"
  - Positive leadership: Gallup engagement data, Kim Cameron's PERMA leadership research
  - Change/transformation: Prosci / McKinsey change failure rate statistics

- [x] **Fix EN/FR/CA impostor syndrome posts** — missing closing coaching CTA sentence (only ES had it)
  Added to EN, FR, CA: the "With the right support…" closing sentence.

---

## CONTENT — New service pages (structural SEO — highest long-term leverage)

These are the single most impactful SEO investment. Every target keyword needs a dedicated URL.
Create as Hugo content pages (`layout: service` or `layout: single`) in all 4 languages.
Each page: 800–1,500 words, service-specific H1 with keyword, process/methodology section,
credentials visible, service-specific CTA.

- [ ] **Create `/coaching-ejecutivo/` service page** (all 4 languages)
  ES target keyword: `coaching ejecutivo`
  EN: `/executive-coaching/` — target: `executive coaching Barcelona Spain`

- [ ] **Create `/coaching-de-equipos/` service page** (all 4 languages)
  ES target keyword: `coaching de equipos`
  EN: `/team-coaching/`

- [ ] **Create `/consultoria-del-cambio/` service page** (all 4 languages)
  ES target keyword: `consultoría del cambio`
  EN: `/change-consulting/`

- [ ] **Create `/plan-de-carrera/` service page** (all 4 languages)
  Currently mentioned in feature grid with one sentence; no content support.
  EN: `/career-planning/`

---

## CONTENT — Blog content roadmap (keyword clusters)

New posts to write, by cluster. All word counts are targets, not limits.

### Cluster 1 — Coaching Ejecutivo
- [ ] C1-P: "Coaching ejecutivo: qué es, cómo funciona y por qué marca la diferencia" (3,000 words) — pillar
- [ ] C1-S1: "Inteligencia emocional en el liderazgo" (1,500 words)
- [ ] C1-S2: "Burnout ejecutivo: señales, causas y cómo el coaching puede ayudarte" (1,500 words)
- [ ] C1-S3: "Coaching vs. mentoring: ¿qué necesitas realmente?" (1,200 words)
- [ ] C1-S4: "ROI del coaching ejecutivo: resultados medibles" (1,200 words)

### Cluster 2 — Coaching de Equipos & Talleres
- [ ] C2-P: "Coaching de equipos: cómo transformar la forma en que tu equipo trabaja" (2,800 words) — pillar
- [ ] C2-S1: "Seguridad psicológica en equipos: el Proyecto Aristóteles de Google" (1,500 words)
- [ ] C2-S2: "Coaching de equipos vs. coaching individual: cuándo necesitas cada enfoque" (1,200 words)
- [ ] C2-S3: "Cómo resolver conflictos en un equipo sin que explote todo" (1,200 words)
- [ ] C2-S4: "Microlearning en empresas: cuándo las píldoras formativas superan a la formación" (1,200 words)

### Cluster 3 — Liderazgo Positivo
- [ ] C3-P: Expand existing `liderazgo-positivo.md` from ~500 → 2,500 words (add PERMA model,
  Kim Cameron framework, concrete leadership behaviors, engagement metrics)
- [ ] C3-S1: "El modelo PERMA en las organizaciones: psicología positiva aplicada al liderazgo" (1,500 words)
- [ ] C3-S2: "Liderazgo consciente: cómo liderar desde la claridad y la coherencia" (1,200 words)
- [ ] C3-S3: "Bienestar organizacional y liderazgo" (1,200 words)

### Cluster 4 — Consultoría del Cambio
- [ ] C4-P: "Consultoría del Cambio: cómo acompañar transformaciones organizacionales con éxito" (3,000 words) — pillar
- [ ] C4-S1: "Resistencia al cambio en las organizaciones: por qué ocurre y cómo gestionarla" (1,500 words)
- [ ] C4-S2: Link existing `transformar-no-es-cambiar-de-lugar.md` into this cluster (+ add CTA + expand)
- [ ] C4-S3: "Metodologías de gestión del cambio: ADKAR, Kotter y el enfoque centrado en personas" (1,500 words)
- [ ] C4-S4: "Agilidad organizacional: cómo preparar tu empresa para el cambio continuo" (1,200 words)

### Cluster 5 — Desarrollo Profesional & Plan de Carrera
- [ ] C5-P: "Desarrollo profesional con coaching: cómo avanzar con claridad hacia tus objetivos" (2,800 words) — pillar
- [ ] C5-S1: Link existing `sindrome-de-la-impostora.md` into this cluster (+ expand to 1,200 words)
- [ ] C5-S2: "Transición de carrera para directivos: cómo gestionar un cambio profesional con propósito" (1,500 words)
- [ ] C5-S3: "Autoconocimiento: la base de cualquier desarrollo profesional real" (1,200 words)
- [ ] C5-S4: "Propósito profesional: cómo encontrar claridad cuando el trabajo ha perdido sentido" (1,200 words)

---

## LOW — Nice to have

- [x] Fix `<html>` Microdata prefix: removed `itemscope itemtype` from `baseof.html` (redundant with JSON-LD)
- [x] Localize `metadata.keywords` — added language-specific `keywords` front matter to EN/FR/CA `_index.md`
- [x] Add `summary:` front matter to each blog post — already resolved: `layouts/_default/list.html`
  uses `.Description` directly, so `description:` front matter controls listing excerpts
- [ ] Consider a Related Posts partial to make the internal link matrix maintainable at scale
- [ ] Add a cluster taxonomy (`taxonomies = ['cluster']` in `hugo.toml`) once 10+ posts exist
- [ ] Investigate replacing webfont-loader JS with `<link rel="preconnect">` + `font-display:swap`
  for faster font loading (reduces FOUT risk)
