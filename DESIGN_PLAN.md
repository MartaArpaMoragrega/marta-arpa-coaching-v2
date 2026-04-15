# Design Improvement Plan — Marta Arpa Coaching v2

Critical look at the site as it stands today. Each item includes a clear justification — the *why* matters as much as the *what*, so nothing here is done for its own sake.

Status legend: `[ ]` = not started · `[~]` = in progress · `[x]` = done · `[?]` = pending decision / content input needed

---

## Priority 1 — Conversion & Credibility Gaps

These items directly affect whether a visitor hires Marta. They should be addressed before any visual polish.

---

### D-02 · Make the booking URL a single config variable
**Status:** `[x]`

**Problem:** The Brevo meeting link (`https://meet.brevo.com/marta-arpa/sesion-gratuita-`) currently appears in **9 places**:

| File | Location | Context |
|---|---|---|
| `config/_default/params.toml:43` | `navigation_button.link` | Nav header CTA button |
| `content/spanish/_index.md:10` | `banner.button.link` | Homepage banner CTA |
| `content/spanish/_index.md:96` | `call_to_action.button.link` | Homepage bottom CTA |
| `content/english/_index.md:10` | `banner.button.link` | Same, EN |
| `content/english/_index.md:96` | `call_to_action.button.link` | Same, EN |
| `content/french/_index.md:10` | `banner.button.link` | Same, FR |
| `content/french/_index.md:96` | `call_to_action.button.link` | Same, FR |
| `content/catalan/_index.md:10` | `banner.button.link` | Same, CA |
| `content/catalan/_index.md:96` | `call_to_action.button.link` | Same, CA |

The contact page layout (`layouts/_default/contact.html:29`) is already correct — it reads from `site.Params.navigation_button.link`. That is the only place the pattern works as intended today.

**Why it matters:** Booking platforms change. Brevo meeting links rotate when plans change or when a new meeting type is created. When that happens, whoever updates the site will find `params.toml`, change it, and think they're done — not knowing there are 8 more copies in content files. The banner and bottom-of-page CTA will silently point to a dead or wrong URL. These are the two highest-traffic booking touchpoints on the site.

**The fix — two-step:**

**Step 1 — remove the link from content front matter entirely.**
The booking URL is not content — it's infrastructure config. None of the four language files need to carry it. In `layouts/index.html`, the banner and `call_to_action` button render links directly from front matter today. Change those template reads to always use `site.Params.navigation_button.link` for the button href, and drop the `link:` field from all eight front matter entries.

This means:
- `content/{spanish,english,french,catalan}/_index.md` — remove `link:` from `banner.button` and `call_to_action.button` (keep `label:`, `enable:`)
- `layouts/index.html` — for both the banner button and the CTA button, replace `.button.link` with `site.Params.navigation_button.link`

**Step 2 — document it.**
Add a comment above the `navigation_button` block in `params.toml` making clear this is also the source for the homepage banner and CTA buttons. Update `CLAUDE.md` to document it under "Key config locations":

```
| Booking URL (all CTAs) | config/_default/params.toml | navigation_button.link |
```

**What stays the same:** `params.toml:43` remains the one place to edit. The contact layout already reads from there. After this change, every booking button on the site will read from the same source.

**Files to touch:** `layouts/index.html`, `content/spanish/_index.md`, `content/english/_index.md`, `content/french/_index.md`, `content/catalan/_index.md`, `config/_default/params.toml` (comment only), `CLAUDE.md`

---

### D-03 · Fix the mid-range (tablet) layout gap
**Status:** `[x]`

**Problem:** `custom.scss` has four media query blocks. Their effective coverage is:

| Block | Range covered | What it controls |
|---|---|---|
| `max-width: 575.98px` | phones only | logo max-width |
| `max-width: 991.98px` | phones + tablets | nav collapse centering |
| `max-width: 991px` (inside `.banner`) | phones + tablets | banner stacking + image height |
| `max-width: 767.98px` | phones + small tablets | profile image caps |

The result: everything between 576px and 991px — iPad Mini (768px), iPad Air (820px), iPad Pro (1024px in portrait), every 13" laptop running a split view — falls into the mobile banner path. The banner image is capped at **260px** at 900px viewport width. That is the same height as a 375px phone. Proportionally, it occupies 29% of the viewport height on a 900px screen vs. 69% on a phone. The section looks deflated.

**Why it matters:** Coaching is sold to professionals. A meaningful share of them will first encounter this site on an iPad or a work laptop in a non-maximised window. A banner that looks correctly sized on a phone and on a 1200px desktop but visibly underpowered at 800px signals that nobody tested it — which reflects on the care taken in the work being sold.

---

**The three areas that need explicit tablet treatment:**

#### Area 1 — Banner image height

Current state: inside `.banner { @media (max-width: 991px) }`, the image wrapper is:
```scss
.banner-image-wrap {
  position: relative;
  width: 100%;
  height: 260px;    // ← same at 375px and 900px
  ...
}
```

Fix: split the existing mobile block into two. Keep 260px for true phones, increase to 380px for tablets:
```scss
// phones
@media (max-width: 575.98px) {
  .banner-image-wrap { height: 260px; }
}
// tablets
@media (min-width: 576px) and (max-width: 991px) {
  .banner-image-wrap { height: 380px; }
}
```
Also increase the banner top padding slightly in the tablet range to give the text column more air before the image starts:
```scss
@media (min-width: 576px) and (max-width: 991px) {
  .banner .container { padding-top: 2.5rem; padding-bottom: 2rem; }
}
```

#### Area 2 — About page profile image

Current state:
```scss
// global (no breakpoint)
.about-profile-img {
  max-height: 380px;
  max-width: 100%;
}

// mobile only
@media (max-width: 767.98px) {
  .about-profile-img { max-width: 220px; }
}
```

The layout uses `col-8 col-sm-6 col-lg-4`. At 576–767px the image is in a `col-sm-6` (50% width). At 768–991px the column is still `col-sm-6` because `col-lg-4` only kicks in at 992px. So throughout the entire tablet range, the image column is 50% of viewport width — up to ~495px wide on a 991px screen.

The `max-height: 380px` global rule caps height. But there is no `max-width` cap in the 576–991px band. On a 900px screen, the image could render up to 450px wide. Combined with the `max-height: 380px`, a landscape-ish photo would be fine, but a portrait photo would be constrained by height first, leaving horizontal whitespace on either side.

More importantly: the jump from `max-width: 220px` (at 767px) to unconstrained (at 768px) is a 230px width change across a 1px breakpoint. While users don't resize browsers this way, it signals the CSS was written reactively rather than designed as a system.

Fix: add a tablet-specific cap that bridges the gap:
```scss
@media (min-width: 576px) and (max-width: 991px) {
  .about-profile-img { max-width: 280px; }
}
```

#### Area 3 — CTA profile image

Current state:
```scss
@media (max-width: 767.98px) {
  .cta-profile-img {
    max-width: 260px !important;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
}
```

The CTA layout (`col-lg-4 col-md-5`) places the image in a `col-md-5` column from 768px upward — that's 41.67% of viewport, so ~320px at 768px and ~413px at 991px. For a portrait photo, `img-fluid w-100` fills this width with no height constraint, which at 413px could mean a very tall image on the right side of the CTA section.

On a 768-991px screen the layout is two-column (Bootstrap's `md` breakpoint activates both `col-md-5` and `col-md-6`), so the image and text are side by side — this is actually fine and is the intended layout. The problem is purely the height: without a `max-height`, a tall portrait photo in the CTA section will make the section abnormally tall on tablets.

Fix: add a `max-height` constraint for the tablet range only:
```scss
@media (min-width: 768px) and (max-width: 991px) {
  .cta-profile-img { max-height: 320px; }
}
```

---

**Implementation summary — exact changes to `assets/scss/custom.scss`:**

1. Split the single `max-width: 991px` block inside `.banner` into a phone block (`max-width: 575.98px`) and a tablet block (`min-width: 576px) and (max-width: 991px)`).
2. In the tablet banner block: `height: 380px` for the image, slightly increased `.container` padding.
3. Add `@media (min-width: 576px) and (max-width: 991px)` block with `max-width: 280px` for `.about-profile-img`.
4. Add `@media (min-width: 768px) and (max-width: 991px)` block with `max-height: 320px` for `.cta-profile-img`.

No layout file changes needed — this is entirely a CSS concern.

**Files to touch:** `assets/scss/custom.scss`

---

## Priority 2 — Visual Consistency & Quality

Issues that a visitor may not consciously name but that accumulate into a "something feels off" impression.

---

### D-04 · Unify the icon system
**Status:** `[x]`

**Problem:** The six feature cards on the homepage use Font Awesome icons from different semantic families (briefcase, users, bullseye, sync, lightbulb, route). The three philosophy cards on the About page use a completely different selection (comments, chart-line, gem). There's no visual thread connecting them.

**Why it matters:** Icons are a visual shorthand — when they feel arbitrary, they erode rather than reinforce the message. For a brand built on clarity and intentionality, mismatched icons are a contradiction.

**Proposed change:**
- Define a visual principle: icons should feel *drawn from the same hand* — all outline or all solid, same weight, same metaphor family (human/relational vs abstract/technical).
- Recommended direction: replace all six feature icons with outline-style human/action icons. Suggestions below — final picks require Marta's input on meaning:
  - Coaching Ejecutivo → `fa-regular fa-handshake`
  - Talleres personalizados → `fa-regular fa-people-group` or `fa-users`
  - Píldoras de Foco → `fa-regular fa-crosshairs` (or keep bullseye, it's fine)
  - Consultoría del Cambio → `fa-regular fa-arrows-spin` → `fa-regular fa-arrow-trend-up`
  - Liderazgo Positivo → `fa-regular fa-lightbulb` (keep, it's strong)
  - Plan de Carrera → `fa-regular fa-map` (clearer than route)
- Apply the same pass to the About philosophy icons.
- All icons: consistent 1.4rem size, primary color (`#0AA8A7`), no circles — let whitespace do the work.

**Files to touch:** `content/{lang}/_index.md` (feature icon fields), `content/{lang}/about.md` (philosophy icon fields)

---

### D-05 · Service illustration visual audit and sizing
**Status:** `[ ]`

**Audit results — all four images inspected:**

All four are 512×512 PNG — dimensions are correct. Alpha channel status:
- `coaching-ex.png` (182K) — `alpha=Blend` ✓
- `talleres-personalizados.png` (225K) — `alpha=Blend` ✓
- `pildoras-foco.png` (180K) — `alpha=Undefined` ⚠ (see below)
- `consultancy.png` (102K) — `alpha=Blend` ✓ but see style note

---

**Finding 1 — `consultancy.png` is from a completely different illustration family**

The three other images (coaching-ex, talleres, pildoras) share a consistent visual language: flat vector illustration, muted pastel color palette, rounded cartoonish character design, light neutral backgrounds, multiple people shown in collaborative settings.

`consultancy.png` is the outlier: a single suited figure with a briefcase standing in front of a large coral/terracotta upward-trend arrow against a warm beige city skyline. Different character proportions, different color temperature (warmer, more saturated), a solid non-transparent background, and a solo-figure composition against a backdrop rather than an interactive-scene composition. It reads as a stock business illustration from a different library.

The effect on the page: three sections feel like a coherent set, and the fourth — Consultoría del Cambio — breaks the rhythm. The mismatch is noticeable.

**What to do:** Replace `consultancy.png` with a new illustration in the same flat-scene style as the other three. The concept should show an organizational or team context — people aligned around a shared goal, a process being mapped, or a team navigating change together. Specifically avoid: lone figures, upward arrows, briefcases, cityscapes. Those are the visual vocabulary of generic corporate consulting, not the brand Marta is building.

The replacement must come from the same illustration source/artist used for the other three, or from a library that matches that style. Do not source from a different library and attempt to make it blend — the mismatch will persist.

---

**Finding 2 — `pildoras-foco.png` is too visually similar to `talleres-personalizados.png`**

Both show a small group of people seated around a table with someone presenting or pointing at something. The visual difference is minimal: pildoras has a bullseye target on the screen, talleres has a whiteboard. At thumbnail scale — which is how service rows render on mobile — these look nearly identical.

A visitor scanning the homepage will not easily distinguish these two services by their illustrations alone. The illustration should do work the copy doesn't have to.

**What to do:** When sourcing a replacement for consultancy (finding 1), also evaluate whether pildoras-foco can be replaced with something more distinct — a single person at a focused workstation, a close-up of a timer or checklist, something that reads as "individual clarity and speed" rather than another meeting scene.

---

**Finding 3 — `pildoras-foco.png` alpha channel is `Undefined`**

The other three images report `alpha=Blend`. Pildoras reports `alpha=Undefined`, which in ImageMagick means the alpha channel is present but its handling is not explicitly declared. In practice this usually renders identically to `Blend`, but it is a minor inconsistency in how the file was exported.

**What to do:** When the image is replaced (finding 2), export with explicit alpha transparency. If keeping the current image, re-export it from the source to set a defined alpha channel. Low priority — only action if the other findings prompt a re-export anyway.

---

**Summary — what actually needs to happen:**

| Image | Action |
|---|---|
| `coaching-ex.png` | No action needed |
| `talleres-personalizados.png` | No action needed |
| `pildoras-foco.png` | Replace if possible (too similar to talleres); re-export for alpha at minimum |
| `consultancy.png` | **Must replace** — wrong illustration style, wrong concept |

This is a content/asset task, not a code task. The deliverable is two new PNG files (512×512, transparent background, same flat illustration style as coaching-ex and talleres). No CSS or layout changes are needed — the existing `.service-img-wrap` border-radius and Hugo's image pipeline will handle the rest correctly once the source files are right.

**Files to touch:** `assets/images/services/consultancy.png` (replace), `assets/images/services/pildoras-foco.png` (replace or re-export)

---

### D-06 · Improve form field styling and interaction states
**Status:** `[x]`

**Current state — what the form actually does:**

Every input and textarea in `contact.html` carries `class="form-control shadow-none"`. Bootstrap's `.form-control` has a built-in focus style: the border shifts to `#86b7fe` (a blue) and a blue glow ring appears via `box-shadow`. The `shadow-none` utility sets `box-shadow: none !important`, killing the glow ring. The border-color shift to blue still fires — but it's a generic Bootstrap blue with no relationship to the site's teal brand.

The net result: focusing a field produces a faint blue border change. No ring, no teal, no confirmation that the input is active. On mobile, where the virtual keyboard covers most of the screen, that small blue border is often not visible at all.

There are no hover states, no explicit `.is-invalid` styles, and no disabled/loading state on the submit button.

---

**The four things to fix, in order of impact:**

#### Fix 1 — Replace Bootstrap's blue focus with a teal ring

Bootstrap's focus overrides live in `_forms.scss` via CSS custom properties. The cleanest override for our setup is to target `.form-control` directly:

```scss
// ── Contact form — interaction states ────────────────────────────────────────
.contact-form-card {
  .form-control {
    &:hover:not(:focus) {
      border-color: darken(#ced4da, 10%); // subtle warm-up before focus
    }
    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.15);
      outline: none;
    }
  }
}
```

Scoping to `.contact-form-card` ensures this doesn't bleed into any other Bootstrap form controls that might exist elsewhere in the theme.

The `rgba($color-primary, 0.15)` glow is soft enough not to overwhelm the pale-teal card background while still being clearly visible. The hover state (`darken(#ced4da, 10%)` ≈ `#b0b8c1`) gives a one-step transition: neutral → darker border on hover → teal border + ring on focus.

#### Fix 2 — Validate that `.is-invalid` works with our overrides

Bootstrap's `.is-invalid` adds a red border and a small warning icon via `background-image`. Our `shadow-none` strips the focus glow on invalid fields too, which means a field that fails HTML5 validation (e.g. submitting with empty `required` fields or a malformed email) gets a red border but no ring — inconsistent with the valid focus treatment.

Add an explicit invalid focus state:
```scss
.contact-form-card {
  .form-control {
    &.is-invalid:focus,
    &:invalid:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
    }
  }
}
```

Note: the `required` fields on this form rely on native browser validation, which only triggers on submit — not inline as the user types. This is acceptable behavior and no change to the form HTML is needed.

#### Fix 3 — Submit button disabled state

The submit button (`btn btn-primary w-100`) has no explicit disabled styling. Bootstrap's `.btn:disabled` does add `opacity: 0.65` by default, which is adequate — but it only applies if the button carries the `disabled` attribute or `.disabled` class. Neither is added anywhere. Since this is a static form (no JS intercepting the submit), the browser handles submission natively and the button doesn't need a JS-managed disabled state.

However: add an explicit `cursor` rule so that if the reCAPTCHA challenge isn't completed, the button gives tactile feedback:
```scss
.contact-form-card {
  .btn[type="submit"] {
    transition: opacity 0.15s ease;
    &:disabled {
      cursor: not-allowed;
    }
  }
}
```

#### Fix 4 — reCAPTCHA overflow on narrow screens

Google's reCAPTCHA v2 widget renders a fixed-width iframe — 304px wide minimum, 78px tall. On screens below 320px (older small phones) or when the form column is constrained, this overflows its container with no scrollbar, causing horizontal page overflow.

The fix is a CSS transform scale approach scoped to the reCAPTCHA container:
```scss
.g-recaptcha {
  @media (max-width: 360px) {
    transform: scale(0.85);
    transform-origin: 0 0;
  }
}
```

This shrinks the widget to ~258px at the origin point, fitting within any reasonable phone viewport without affecting the widget's function. No changes to `contact.html` needed.

---

**Implementation summary — all changes go in `assets/scss/custom.scss`, appended to the existing contact page block:**

1. Scoped `.form-control` hover + focus states (teal ring, teal border)
2. Scoped `.is-invalid:focus` state (red ring)
3. Submit button `cursor: not-allowed` on `:disabled`
4. reCAPTCHA scale at `max-width: 360px`

No changes needed to `contact.html` — this is entirely CSS.

**Files to touch:** `assets/scss/custom.scss`

**Additional work done beyond original scope (during implementation):**
- Button hierarchy: booking CTA (`btn-primary`) vs. form submit (`btn-outline-primary w-100`)
- Two-line booking button with `.btn-caption` qualifier line inside ("30 min · Sin compromiso")
- Label `for`/input `id` pairs added to all form fields
- `autocomplete` attributes added (`given-name`, `family-name`, `email`)
- Inline button styles extracted to `.btn-caption` SCSS class

---

### C-01 · Contact page step 3 logic — content decision needed
**Status:** `[?]`

**Issue:** The "¿Qué pasa después?" steps list describes the form path: write → I respond → we talk. Step 3 reads *"Hablamos / Acordamos una sesión gratuita para conocernos."* — but the booking button on the same page already skips directly to that outcome, bypassing steps 1 and 2.

A visitor reading the page top-to-bottom sees: intro → steps (what happens after you write?) → booking CTA. The steps feel like they belong to the form path, but they sit above the booking button in the reading order, which creates a mild logic loop.

**Decision needed from Marta:** Should step 3 be reworded to reflect only the form outcome (e.g., *"Te propongo una sesión para conocernos"*)? Or should the steps heading be reframed to cover both paths (e.g., *"¿Cómo funciona?"*)? No code change until the copy direction is agreed.

**Files to touch:** `content/{spanish,english,french,catalan}/contact.md` (copy change only)

---

### D-07 · Style the language selector
**Status:** `[ ]`

**Current state:**

```html
<select class="m-2 border-0" id="select-language" onchange="location = this.value;">
  <option value="/...">Español</option>
  <option value="/en/..." selected>English</option>
  ...
</select>
```

`border-0` removes the only styling; the rest is entirely OS-native. The font is the browser default (not Lato), the arrow is the system chevron, and on mobile iOS it renders as a full-screen picker sheet. It looks completely disconnected from the nav around it.

**Why it matters:** The language selector appears in the header on every page in every language. It's one of the most frequently seen elements on the site. A native `<select>` in an otherwise composed header signals that the site was assembled rather than designed.

---

**Approach: style the `<select>` directly, do not replace it**

A fully custom JS dropdown would be more styleable but adds JavaScript, requires ARIA roles, needs keyboard handling, and is fragile. The `<details>`/`<summary>` pattern has inconsistent browser support for this use case. 

The right call here is to keep the `<select>` — it already works correctly for keyboard navigation, screen readers, and mobile — and style its *closed state* (the always-visible part) to match the site's design. The open state (the OS dropdown list) remains native; this is acceptable and is what users expect for language switching.

**What CSS can and cannot do to a `<select>`:**
- ✓ `appearance: none` — removes all OS chrome (border, arrow, background)
- ✓ `font-family`, `font-size`, `color`, `padding`, `cursor` — fully styleable
- ✓ Background-image SVG arrow — replaces the OS chevron with a custom one
- ✗ `<option>` elements — cannot be styled cross-browser; they remain OS-native when the list opens

**Visual spec:**

Wrap the `<select>` in a `<div class="lang-switcher">` that provides a globe icon prefix and a custom dropdown arrow via CSS `::after`. The `<select>` sits over the wrapper, transparent, so it intercepts all clicks while the wrapper renders the visual treatment.

```
🌐 ES ▾
```

- Globe icon: `fas fa-globe`, same color as nav links (`$text-dark`)
- Language display: `.Lang | upper` → `ES`, `EN`, `FR`, `CA` (compact, conventional)
- Arrow: inline SVG as `background-image` on the `<select>`
- No border, no background — blends into the navbar like a nav-link
- Hover: text color shifts to `$color-primary` (matches nav link hover)
- Font: Lato, `0.9rem`, matching the nav links

**Exact HTML change in `header.html`** — replace the bare `<select>` with:

```html
<li class="nav-item lang-switcher-wrap">
  <i class="fas fa-globe lang-switcher-icon"></i>
  <select id="select-language" class="lang-switcher-select" onchange="location = this.value;">
    {{ range .Page.AllTranslations }}
    <option value="{{ .RelPermalink }}"{{ if eq .Lang $.Page.Lang }} selected{{ end }}>
      {{ .Lang | upper }}
    </option>
    {{ end }}
  </select>
</li>
```

Note: the existing template iterates `AllTranslations` through `$siteLanguages` to enforce a display order — that loop can be simplified to a plain `range .Page.AllTranslations` since Hugo returns them in the order defined in `languages.toml`.

**Exact SCSS to add:**

```scss
// ── Language switcher ─────────────────────────────────────────────────────────
.lang-switcher-wrap {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.5rem;
}

.lang-switcher-icon {
  font-size: 0.8rem;
  color: $text-dark;
  pointer-events: none;
}

.lang-switcher-select {
  appearance: none;
  background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23555'/%3E%3C/svg%3E") no-repeat right 0.1rem center;
  background-size: 0.5rem;
  border: none;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  color: $text-dark;
  padding: 0.25rem 1rem 0.25rem 0;
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: $color-primary;
  }
  &:focus {
    outline: none;
    color: $color-primary;
  }
}
```

**Mobile behaviour:** the `lang-switcher-wrap` is a `flex` row; inside the collapsed mobile nav it flows inline with the other items. No additional breakpoint needed — it already collapses with the nav.

**Files to touch:** `layouts/partials/header.html`, `assets/scss/custom.scss`

---

### D-08 · Add active/current link indicator to navigation
**Status:** `[ ]`

**Problem:** There is no visual indication of which page the user is currently on. All nav links look identical regardless of location.

**Why it matters:** Active state is a fundamental orientation signal. Its absence is disorienting — users can't confirm they navigated successfully. This is especially confusing on a multilingual site where the URL structure changes per language.

**Proposed change:**
- In `layouts/partials/header.html`, detect the active page with Hugo's `.IsMenuCurrent` or `.HasMenuCurrent` and add an `active` class to the matching `<li>`.
- CSS: underline or `border-bottom: 2px solid #0AA8A7` on the active link.
- Do not use bold weight as the only indicator (poor contrast for low-vision users).

**Files to touch:** `layouts/partials/header.html`, `assets/scss/custom.scss`

---

## Priority 3 — Content & UX Enhancements

Not urgent, but each one raises the ceiling on what the site can do for Marta's business.

---

### D-09 · Blog post enhancements: reading time, author bio, related posts
**Status:** `[ ]`

**Problem:** Blog posts are currently a title, banner image, and body text — nothing else. There's no reading time estimate, no author bio at the foot of the post, and no suggested reading to keep visitors on-site.

**Why it matters:** The blog is Marta's primary SEO and authority-building channel. Posts that end abruptly with no context about the author or invitation to read more leave value on the table — both for human readers and for search engine signals.

**Proposed change:**
- Reading time: Hugo provides `.ReadingTime` out of the box. Add it to the post header (e.g., "5 min de lectura") in the single post layout.
- Author bio box: a simple card at the end of each post with Marta's profile photo, one-sentence bio, and a link to the full About page. Static partial, no new content required.
- Related posts: use Hugo's `.Site.RegularPages` with a tag match (requires adding `tags` to post front matter first) or simply show the 2 most recent posts in the same language. Requires a new partial and small layout edit.
- Requires: adding `tags` field to existing blog posts (optional but valuable for SEO).

**Files to touch:** `layouts/_default/single.html` (create if absent), `layouts/partials/author-bio.html` (new), `content/{lang}/blog/*.md` (add tags)

---

### D-10 · Improve typography hierarchy and heading contrast
**Status:** `[ ]`

**Problem:** The Major Third scale (1.25) produces a compressed heading hierarchy. At base 16px: h3 ≈ 20px, h2 ≈ 25px, h1 ≈ 31px. In practice, many sections use the same heading size because the difference is barely perceptible on screen. Body text is `#777` (medium gray on white) — this needs a contrast check against WCAG AA (minimum 4.5:1 ratio for normal text).

**Why it matters:** Poor typographic hierarchy makes every section feel equally important — which means nothing feels important. Insufficient body text contrast is an accessibility failure and a readability burden.

**Proposed change:**
- Audit body text color `#777` against `#fff` background using a contrast checker. If it fails WCAG AA (likely — `#777` on `#fff` is approximately 4.48:1, borderline), bump to `#666` or `#555`.
- Increase effective scale on section headings by adding `letter-spacing: -0.02em` and `font-weight: 700` (already available in Lato) on `h1` and `h2` to differentiate them visually from body without changing the size scale.
- Add a thin decorative line or small icon accent below key section headings (e.g., the "Servicios" and "Sobre mí" headings) to create visual anchors that break up the monotony of stacked sections.

**Files to touch:** `assets/scss/custom.scss`, possibly `hugo.toml` (`font_scale` if changing the scale globally)

---

### D-11 · Clean up unused and legacy asset files
**Status:** `[ ]`

**Problem:** The `assets/images/` directory contains files that appear to be unused:
- `service-1.png`, `service-2.png`, `service-3.png` — legacy service images
- `logo.png` — superseded by `static/images/logo-ma.webp`
- `blog/post-1.jpg` through `blog/post-6.jpg` — generic placeholder images not referenced by any current blog post

**Why it matters:** Unused assets inflate build times (Hugo processes everything in `assets/`), bloat the repository, and create confusion for anyone maintaining the site later. The logo duplication is especially risky — a future editor might reference the wrong file.

**Proposed change:**
- Verify each file is genuinely unreferenced (grep for the filename in all templates and content).
- Delete confirmed orphans.
- If any of the `blog/post-*.jpg` files might be used as fallback images, document that explicitly in CLAUDE.md; otherwise, remove them.

**Files to touch:** `assets/images/` (deletions only, after verification)

---

### D-12 · Footer: attribution and visual weight
**Status:** `[ ]`

**Problem:** The footer currently includes a theme attribution line ("Theme by GetHugoThemes"). This is standard for free themes but not appropriate for a professional client site. Additionally, the footer's visual weight relative to the rest of the page has not been reviewed — it may feel abrupt or too light.

**Why it matters:** The footer is the last thing a visitor reads. A theme attribution link on a professional coaching website undermines the impression that this is a custom, polished product. It also adds an outbound link that sends traffic away with no benefit to Marta.

**Proposed change:**
- Remove the theme attribution line from `layouts/partials/footer.html`.
- Replace with: "© {year} Marta Arpa · Todos los derechos reservados" (use Hugo's `now.Year` for the year).
- Review footer background and text contrast — if the current footer uses a dark background, ensure all link colors meet contrast requirements.

**Files to touch:** `layouts/partials/footer.html`

---

## Priority 4 — Accessibility Baseline

These items don't affect visual design for most users but are legally relevant in Spain (WCAG 2.1 AA compliance is required for public-facing commercial sites under Spanish accessibility law) and affect search ranking.

---

### D-13 · ARIA labels and keyboard navigation audit
**Status:** `[ ]`

**Problem:** Icon-only buttons (social media icons in the contact page, language selector, potentially nav items on mobile) may lack accessible names. No keyboard navigation testing has been documented.

**Why it matters:** Spanish legislation (Real Decreto 1112/2018) requires WCAG 2.1 AA for many commercial websites. Even outside legal obligation, 10–15% of users have some form of disability affecting how they interact with the web.

**Proposed change:**
- Add `aria-label` attributes to all icon-only interactive elements.
- Test full keyboard navigation path: homepage → contact form → submit. Document any tab traps or skipped elements.
- Ensure the cookie consent banner (Cookiebot) is keyboard-navigable and has visible focus styles.
- Verify that the reCAPTCHA challenge is reachable via keyboard.

**Files to touch:** `layouts/partials/header.html`, `layouts/_default/contact.html`, `layouts/partials/footer.html`

---

### D-14 · Color contrast audit on primary brand color
**Status:** `[ ]`

**Problem:** Primary color `#0AA8A7` (teal) is used for links, button text (on white), icon colors, and decorative elements. Its contrast against white (`#fff`) is approximately 2.97:1 — well below the WCAG AA minimum of 4.5:1 for normal-weight text.

**Why it matters:** Teal-on-white for body-size text or small UI labels is an accessibility failure. This is likely the case for the contact step labels and possibly for "read more" link text.

**Proposed change:**
- Audit every place `#0AA8A7` is used as a text color (not a background) on a light surface.
- For text uses: darken to `#087E7D` or `#076665` until contrast meets 4.5:1. This preserves the teal brand feel while being accessible.
- For large text (≥18pt / ≥24px) and icon-only uses, the 3:1 ratio (WCAG AA large text) threshold applies — `#0AA8A7` on white may pass here.
- Do not change the primary color for backgrounds or decorative uses — only for text on light backgrounds.

**Files to touch:** `assets/scss/custom.scss`, `hugo.toml` (`color_primary` if the accessible version should be global)

---

## Execution Notes

- Items **D-01 through D-03** should be completed before any public launch or marketing push.
- Items **D-04 through D-08** can be addressed in one styling pass — they are all CSS/template work with no content dependencies.
- Items **D-09** and **D-10** require Marta's input (testimonial text, blog tags, approval on typography changes).
- Items **D-11** and **D-12** are quick wins that can be done in under an hour combined.
- Items **D-13** and **D-14** should be done before the Phase 8 QA pass already planned in CLAUDE.md.

---

*Last updated: 2026-04-15*
