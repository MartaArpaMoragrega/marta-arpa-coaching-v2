# Design Improvement Plan — Marta Arpa Coaching v2

Critical look at the site as it stands today. Each item includes a clear justification — the *why* matters as much as the *what*, so nothing here is done for its own sake.

Status legend: `[ ]` = not started · `[~]` = in progress · `[x]` = done

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
**Status:** `[ ]`

**Problem:** The custom CSS has two effective breakpoints — mobile (<576px) and desktop (≥992px). The 576–991px band (tablets, large phones in landscape, small laptops) receives neither treatment. The banner image drops to 260px height as if it were a phone, but the viewport is wide enough for a richer layout.

**Why it matters:** A significant share of coaching-service visitors browse on iPad or a 13" laptop. A layout that looks neither mobile nor desktop at those sizes reads as unfinished and undermines perceived quality.

**Proposed change:**
- Audit every custom media query block in `custom.scss` and introduce an explicit `@media (min-width: 576px) and (max-width: 991px)` tablet tier.
- Banner: increase image height to ~360px, keep text-first stacking but give it more breathing room.
- About page profile image: intermediate max-width (~300px) between the current 220px mobile and 380px desktop cap.
- CTA section: profile image should scale proportionally, not jump from 260px phone to full-size desktop.
- Service image containers: test the 20px border radius on tablet — may need to scale down to 12px to avoid clipping on narrower renders.

**Files to touch:** `assets/scss/custom.scss`

---

## Priority 2 — Visual Consistency & Quality

Issues that a visitor may not consciously name but that accumulate into a "something feels off" impression.

---

### D-04 · Unify the icon system
**Status:** `[ ]`

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

**Problem:** The four service illustration PNGs in `assets/images/services/` were specified as "transparent RGBA illustrations that blend with section backgrounds." Without seeing them rendered at every breakpoint, the risk is: jagged edges, inconsistent visual weight between the four images, or one image looking obviously different in style from the others.

**Why it matters:** Service rows are the most content-rich section of the homepage. If one illustration looks different from the others, it signals that different hands worked on the site at different times — even if the copy is strong.

**Proposed change:**
- Do a full visual review of all four service images at: desktop (≥1200px), tablet (768px), and mobile (<576px).
- Check: do all four have consistent visual weight? Are edges crisp? Does the RGBA transparency blend correctly on both the white and pale-teal (`#EDF6F5`) alternating backgrounds?
- If any image looks out of place, flag it for replacement at the source — do not attempt to compensate with CSS.
- Ensure all four are genuinely square 512×512 source PNGs as specified (Hugo's image pipeline depends on this for correct responsive srcsets).

**Files to touch:** `assets/images/services/*.png` (replacement only if needed)

---

### D-06 · Improve form field styling and interaction states
**Status:** `[ ]`

**Problem:** The contact form uses Bootstrap's `shadow-none` utility, stripping the only default visual feedback from input focus. There are no documented focus ring, hover, or error states in `custom.scss`. On a high-stakes contact form (the conversion endpoint of the entire site), invisible interaction states are a UX liability.

**Why it matters:** A form that doesn't respond to input makes users unsure whether it's working. This is especially damaging on mobile where fat-finger errors are common and clear error states are the only recovery path.

**Proposed change:**
- Add to `custom.scss`:
  - Focus state: `border-color: #0AA8A7; box-shadow: 0 0 0 3px rgba(10,168,167,0.15);` on all `input:focus` and `textarea:focus`.
  - Hover state: subtle `border-color` shift on hover before focus.
  - Invalid state: red border + short error message support (Bootstrap `.is-invalid` is already available, just needs visual confirmation it works with the current overrides).
- Review reCAPTCHA v2 widget container — it renders with a fixed Google iframe that may overflow on very narrow screens. Add `max-width: 100%; overflow: hidden;` to its wrapper if needed.
- Submit button: ensure the loading/disabled state has a visible style difference (opacity drop is sufficient, but must be explicit).

**Files to touch:** `assets/scss/custom.scss`, `layouts/_default/contact.html`

---

### D-07 · Style the language selector
**Status:** `[ ]`

**Problem:** The language switcher is a raw HTML `<select>` element with no custom styling. On every browser and OS it renders differently — a system-native dropdown that looks entirely unlike the rest of the site's UI.

**Why it matters:** The language selector is visible on every page, on every device. A native `<select>` in an otherwise polished header signals that the site was assembled rather than designed.

**Proposed change:**
- Replace `<select>` with a CSS-only custom dropdown (no JS dependency): hidden `<select>` + styled label overlay, or a `<details>`/`<summary>` pattern that degrades cleanly.
- Visual spec: same height as the nav CTA button, no background fill, border `1px solid #ECECEC`, globe icon prefix (Font Awesome `fa-globe`), current language code displayed (ES / EN / FR / CA).
- Mobile: collapses into the centered nav column, same as the CTA button.
- Fallback: the hidden `<select>` remains fully functional for accessibility (keyboard nav, screen readers).

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
