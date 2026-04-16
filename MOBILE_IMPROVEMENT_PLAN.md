# Mobile Improvement Plan — Marta Arpa Coaching v2

**Created**: 2026-04-16  
**Scope**: Mobile UX, accessibility, typography, and performance across all pages.  
**Approach**: Phased — each phase is a focused session. Tick items as they are done.

---

## Audit Summary

The site is responsive by default (Bootstrap 5 grid) with several intentional mobile overrides already in place (banner flex-stack, profile image caps, reCAPTCHA scaling, language switcher centering). The issues below are gaps or regressions — not a full rebuild.

**Breakpoints in use** (from `themes/.../scss/_mixins.scss`):
- `mobile-xs`: ≤ 400px
- `mobile`: ≤ 575px
- `tablet`: ≤ 767px
- `desktop`: ≤ 991px (Bootstrap `lg` collapse threshold)

---

## Phase M1 — Navigation (Hamburger Menu)

**Priority: High** — affects every page on mobile.

### M1.1 — Hamburger icon does not visually toggle to a close icon

**Root cause**: The theme's CSS at `themes/.../scss/templates/_navigation.scss:48–60` expects *both* `.fa-bars` and `.fa-xmark` to be present inside the toggler button, and hides/shows them based on `[aria-expanded="true"]`. Currently `layouts/partials/header.html:15` only renders `.fa-bars` — so the menu never shows a ✕ when open.

```scss
// theme CSS (already there, nothing to change here)
&[aria-expanded="true"] {
  .fa-bars  { display: none; }
  .fa-xmark { display: block; }
}
.fa-xmark { display: none; }
```

**Fix**: Add the `.fa-xmark` icon inside the button in `layouts/partials/header.html`.

```html
<!-- Before -->
<i class="fas fa-bars" aria-hidden="true"></i>

<!-- After -->
<i class="fas fa-bars"  aria-hidden="true"></i>
<i class="fas fa-xmark" aria-hidden="true"></i>
```

- [x] Edit `layouts/partials/header.html` — add `fa-xmark` sibling inside `.navbar-toggler`

### M1.2 — Navbar toggler has no keyboard focus ring

**Root cause**: `_navigation.scss:62` sets `&:focus { box-shadow: none; }`, removing Bootstrap's default ring. The `custom.scss` focus-visible block targets `button:focus-visible` but the theme's `box-shadow: none` overrides it because it uses `:focus` (higher specificity than `:focus-visible`).

**Fix**: Add a higher-specificity `focus-visible` override in `assets/scss/custom.scss`.

```scss
.navigation .navbar-toggler:focus-visible {
  outline: 2px solid $color-primary-text;
  outline-offset: 4px;
  box-shadow: none;
}
```

- [x] Add rule to `assets/scss/custom.scss` (after the existing focus-visible block, ~line 389)

### M1.3 — Verify open/close menu behavior end-to-end on a real device

- [x] Open on a phone (or DevTools → iPhone 14 Pro) and confirm:
  - Hamburger shows ≡ when collapsed
  - Tapping shows menu + icon changes to ✕
  - Tapping again collapses + icon returns to ≡
  - Keyboard Tab reaches toggler and focus ring is visible

---

## Phase M2 — Typography on Mobile

**Priority: High** — affects readability on every page.

### M2.1 — H1 and H2 are too large on phones

**Root cause**: Theme `_typography.scss` reduces h1 to 40px and h2 to 30px at `max-width: 767px` (`@include tablet`). On a 375px screen, 40px headings are very large relative to viewport width (≈10.7vw). No further reduction exists below 576px.

**Fix**: Add a `@include mobile` override in `assets/scss/custom.scss`.

```scss
// Mobile heading scale-down (≤ 575px)
@include mobile {
  h1, .h1 { font-size: 30px; }
  h2, .h2 { font-size: 24px; }
  h3, .h3 { font-size: 20px; }
}
```

- [x] Add rule in `assets/scss/custom.scss` after the existing typography refinements (~line 128)

### M2.2 — `text-align: justify` on the About page is problematic on narrow screens

**Root cause**: `custom.scss:134`: `.about-content { text-align: justify; }`. On narrow viewports (< 400px), justified text creates visible rivers of whitespace between words, harming readability.

**Fix**: Restrict justification to tablet and up.

```scss
.about-content {
  @media (min-width: 576px) {
    text-align: justify;
  }
}
```

- [x] Update `assets/scss/custom.scss:133–135`

### M2.3 — Body `line-height: 1.2` is tight for inline/non-paragraph content

**Root cause**: `_typography.scss:4`: `body { line-height: 1.2; }`. Paragraphs override this to 1.7 (good), but any text not wrapped in `<p>` (e.g., list items, spans, small labels) inherits the tight 1.2. This shows up most on mobile where line wrapping is more frequent.

**Assessment needed**: Check mobile rendering of nav items, feature card text, service row content, and footer links for cramped leading.

- [ ] Audit in DevTools at 375px and note any elements with visually tight line spacing
- [ ] If found: add targeted overrides (`li`, `.feature-card p`, etc.) rather than changing the body rule globally

---

## Phase M3 — Accessibility on Mobile

**Priority: High** — several regressions affect keyboard and screen-reader users.

### M3.1 — Form inputs have no visible focus indicator

**Root cause**: `custom.scss:285`: `.contact-form-card .form-control:focus { outline: none; }`. The box-shadow ring (`0 0 0 3px rgba($color-primary, 0.15)`) is the only visual cue, but its 15% opacity makes it very subtle (≈ 1.5:1 contrast). `input` elements are not covered by the `button:focus-visible` block.

**Fix**: Replace `outline: none` with a real outline (in addition to the box-shadow).

```scss
.contact-form-card .form-control:focus {
  border-color: $color-primary;
  box-shadow: 0 0 0 3px rgba($color-primary, 0.15);
  outline: 2px solid $color-primary-text;  // was: outline: none
  outline-offset: 1px;
}
```

- [ ] Edit `assets/scss/custom.scss:285`

### M3.2 — Social icons in footer use non-AA-compliant color

**Root cause**: `_main.scss:96`: `.social-icons a { color: $color-primary; }` uses `#0AA8A7` (2.97:1 on white), which fails WCAG AA (requires 3:1 for UI components, 4.5:1 for text). The icons are 18px which counts as normal-size text.

**Fix**: Override social icon color in `custom.scss` to use `$color-primary-text`.

```scss
.social-icons a {
  color: $color-primary-text;
  border-color: $color-primary-text;
}
```

- [ ] Add override in `assets/scss/custom.scss` (after footer-related rules)

### M3.3 — `aria-expanded` is never updated on the nav toggler

**Root cause**: The inline script in `header.html:72–82` correctly updates `aria-expanded`, but only that attribute. The theme also checks `aria-expanded="true"` via CSS selector to show `.fa-xmark`. Verify this chain works correctly after M1.1 is done.

**Dependency**: Complete M1.1 first, then re-test.

- [x] After M1.1: confirm `aria-expanded` updates and CSS responds correctly

---

## Phase M4 — Banner / Hero Section

**Priority: Medium** — affects first impression on mobile.

### M4.1 — Banner image height on phones may feel cramped

**Current**: `custom.scss:92`: `.banner-image-wrap { height: 260px; }` on mobile. On a 375px-wide phone, a 260px image block is ≈69% of the viewport height — reasonable but on the low end. On 768px tablets it rises to 380px.

**Assessment**: Open the homepage on a 375px viewport and evaluate whether the photo communicates well at 260px. If Marta's face is cropped or the image looks rushed, increase.

**Possible fix**: Raise mobile height to 300px, or use `aspect-ratio` for more proportional sizing:

```scss
@media (max-width: 575px) {
  .banner-image-wrap {
    height: auto;
    aspect-ratio: 4 / 3;  // proportional to any screen width
  }
}
```

- [ ] Evaluate visually; adjust height or switch to aspect-ratio if needed

### M4.2 — CTA button tap target in the banner

**Current**: The primary CTA (`btn-primary`) uses theme padding `15px 30px` — approximately 48px tall. This passes the 44px minimum. However, the secondary text link (if any) inside `.btn-caption` is small (0.72em ≈ 11.5px) and would be hard to tap precisely.

- [ ] Verify the banner CTA button height ≥ 44px at 375px width in DevTools
- [ ] Ensure `.btn-caption` sub-text is clearly non-interactive (no separate tap target)

---

## Phase M5 — Contact Page

**Priority: Medium** — form completion is a key conversion action on mobile.

### M5.1 — reCAPTCHA may still overflow on very small screens

**Current**: `custom.scss:310–315`: scale(0.85) at ≤ 360px. The reCAPTCHA widget is 304px wide; at 0.85 scale = 258px. On a 320px-wide device (old iPhones, some Android) this leaves only 62px of horizontal padding — may clip against container edges.

**Fix option A**: Lower the breakpoint threshold (apply scale to ≤ 390px instead of ≤ 360px):

```scss
.g-recaptcha {
  @media (max-width: 390px) {
    transform: scale(0.82);
    transform-origin: 0 0;
  }
}
```

**Fix option B**: Wrap reCAPTCHA in `overflow-x: hidden` so clipping is contained.

- [ ] Test on 320px viewport in DevTools
- [ ] Apply whichever fix prevents overflow

### M5.2 — Contact portrait image: assess stacking order on mobile

**Current**: On desktop, portrait is in `col-lg-5` (left) with form in `col-lg-7` (right). On mobile both stack full-width. The portrait appears first.

**Assessment**: A tall portrait at full mobile width can push the form far below the fold.

- [ ] Check the contact page at 375px: is the form visible without scrolling?
- [ ] If portrait is too tall: cap `.contact-col-img img` max-height on mobile (e.g., 300px, object-fit: cover)
- [ ] Consider adding `order-` classes so form appears first on mobile if portrait causes too much scroll

### M5.3 — "Booking" CTA button on contact page: confirm tap target

- [ ] Verify the inline booking button and social link circles (40×40px) have ≥ 44px tap target. If social circles are 40px they fall just short — add `padding: 2px` to compensate without visual change.

---

## Phase M6 — Images & Performance

**Priority: Medium** — affects load time, which is doubly important on mobile networks.

### M6.1 — `<picture>` sources lack `sizes` attribute

**Root cause**: `layouts/partials/image.html` generates `<source>` elements with `media` but no `sizes`. Without `sizes`, the browser assumes `100vw` for each source. For images that are never full-viewport-width (e.g., service images at `col-10` → 83vw, or about portrait at capped 220px), this causes the browser to request larger images than necessary.

**Fix**: Pass a `sizes` parameter when calling the image partial, and output it on the `<img>` tag.

Example for service images (roughly 83vw on mobile, 50vw on desktop):
```html
sizes="(max-width: 991px) 83vw, 50vw"
```

- [ ] Audit each call site of `image.html` partial and add appropriate `sizes` strings
- [ ] Update `layouts/partials/image.html` to accept and pass through a `sizes` parameter

### M6.2 — Banner hero image: add `fetchpriority="high"` / preload

**Current**: The banner image uses `loading="lazy"` globally. The above-the-fold banner image on the homepage should be loaded eagerly with high priority.

**Fix**: In `layouts/index.html` banner section, set `loading="eager"` and `fetchpriority="high"` on the hero `<img>`.

- [ ] Check how the banner image is rendered in `layouts/index.html`
- [ ] Override `loading` and `fetchpriority` attributes for the banner image specifically

### M6.3 — Service section Swiper: verify mobile initialization

**Current**: The Swiper in `script.js` sets `spaceBetween: 24`. On very narrow screens (320px), 24px side padding may cause visual overflow.

- [ ] Test service sections with multiple images on 320px viewport
- [ ] If overflow: reduce `spaceBetween` or add `breakpoints` config to Swiper

---

## Phase M7 — Blog Pages

**Priority: Low-Medium** — blog is content-heavy, mobile readability matters.

### M7.1 — Blog post body: line width and paragraph spacing

**Current**: Blog posts use a full-width container with no max reading width. On large phones in landscape, lines can exceed 80 characters — harder to read.

**Fix**: Constrain the post body column:

```html
<!-- in layouts/_default/single.html or blog post layout -->
<div class="col-lg-8 mx-auto">  <!-- or add prose max-width via CSS -->
```

- [ ] Check current blog post template (`layouts/_default/single.html` or theme equivalent)
- [ ] Add `max-width` constraint on post body prose (e.g., `max-width: 72ch`)

### M7.2 — Related posts section: card layout on mobile

**Current**: Related posts likely use a multi-column grid. On mobile these should stack or go 2-up.

- [ ] Check the related posts partial at the bottom of blog posts
- [ ] Verify cards stack to 1 column on ≤ 575px or use col-sm-6

### M7.3 — Post meta and tag readability

**Current**: `.post-meta` is 0.85rem (13.6px). On mobile this may be slightly small. Minimum recommended is 12px; 13.6px is borderline.

- [ ] Verify `.post-meta` is readable at 375px. If needed, bump to `0.875rem` (14px).

---

## Phase M8 — Footer

**Priority: Low** — footer is seen after scrolling; lower urgency than above-the-fold issues.

### M8.1 — Footer column layout on mobile

**Current**: Footer uses `col-md-3 col-sm-6` — 4 columns on desktop, 2×2 grid on small screens, then full-width on xs. The `col-sm-6` gives 2 columns on 576–767px, which is fine.

- [ ] Confirm footer at 375px shows columns stacking cleanly (1 per row)
- [ ] Ensure footer logo is visible and links have enough spacing

### M8.2 — Footer social icon contrast and tap targets

**Root cause**: `.social-icons a` uses `$color-primary` (#0AA8A7) for icon color and border — fails WCAG AA (see M3.2). Tap target is 40×40px, just below the recommended 44px.

**Fix** (combined with M3.2 override):

```scss
.social-icons a {
  color: $color-primary-text;
  border-color: $color-primary-text;
  // Increase tap target without visual change:
  padding: 2px;         // makes effective tap area 44px
  box-sizing: content-box;
}
```

- [ ] Verify after M3.2 fix; adjust padding if needed

### M8.3 — Footer link spacing for touch

**Current**: `.footer-list a { padding: 5px 0; }` — effective height ≈ 26px (16px font + 10px padding). Below 44px.

**Fix**:

```scss
@media (max-width: 767px) {
  .footer-list a {
    padding: 10px 0;  // 36px total — closer to target
  }
}
```

- [ ] Add override in `assets/scss/custom.scss`

---

## Quick Wins (any order, no phase dependency)

These are isolated and can be done at any time:

- [ ] **M-QW1**: Navbar brand width at `mobile-xs` (≤ 400px) is capped to 50% by `_navigation.scss:11`. This means the logo is max 200px wide on a 400px screen. With our 120px cap in `custom.scss` this doesn't conflict, but verify visually.
- [ ] **M-QW2**: `feature-card div.mb-3 { text-align: justify !important; }` — same rivers-of-whitespace risk as About page. Remove the `!important` justify rule or restrict to wider screens.
- [ ] **M-QW3**: Language switcher on mobile — the 4 language codes (ES/EN/FR/CA) in a row may wrap awkwardly on narrow screens. Check at 320px. Consider reducing `padding` on `.lang-link` or adding `white-space: nowrap` on the switcher row.
- [ ] **M-QW4**: `body { line-height: 1.2; }` — any `<li>` inside footer or feature cards that wraps onto 2 lines will look cramped. Add `li { line-height: 1.5; }` globally if found to be a problem.

---

## Implementation order recommendation

```
M1 (nav) → M2 (typography) → M3 (accessibility) → M5 (contact) → M4 (banner)
→ M6 (images) → M7 (blog) → M8 (footer) → Quick Wins
```

M1 and M2 are the highest visual impact. M3 is required for accessibility compliance.
M4–M8 and Quick Wins can be batched or done opportunistically.

---

## Testing checklist (run after each phase)

- [ ] DevTools: iPhone SE (375×667), iPhone 14 Pro (393×852), Pixel 7 (412×915), Galaxy S8 (360×740)
- [ ] Check all 4 language routes: `/` (ES), `/en/`, `/fr/`, `/ca/`
- [ ] Pages: Homepage, About, Contact, Blog listing, Blog post
- [ ] Keyboard navigation: Tab through entire page, confirm visible focus ring at every step
- [ ] Screen reader: voiceover/TalkBack — nav toggle announces state, form labels read correctly
