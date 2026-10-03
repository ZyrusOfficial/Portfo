# CHANGELOG

## [portrait-v1] — 2026-10-03

### Portrait Integration

**Image Pipeline**
- Saved original portrait to `assets-src/portrait-original.jpg` (never served directly)
- Added `scripts/process-portrait.mjs` — Node.js script using `sharp` to generate all variants
- Auto-orients from EXIF before stripping; all served files contain **zero EXIF/GPS metadata** (verified)
- Generated responsive variants: 480, 800, 1200px in AVIF + WebP + JPEG fallback
- All served variants well under 150KB limit (800px WebP: 26.8KB, JPEG: 37.6KB, AVIF: 37.2KB)
- Generated tiny blurred placeholder (487 chars base64, < 2KB) for first-paint crossfade
- Generated 72px square crop for resume header
- Generated favicon set: 32×32, 180×180, 512×512 PNG crops
- Generated Open Graph card 1200×630

**Placements**

- **Story section (01 / STORY)**: Replaced `[ PHOTO ]` placeholder with responsive `<picture>` element
  - AVIF/WebP/JPEG srcset with `sizes` attributes for optimal loading
  - Explicit `width="400" height="500"` + `aspect-ratio` via CSS to prevent CLS
  - `loading="lazy"` + `decoding="async"` (below fold)
  - Blurred placeholder crossfade on load
  - `object-position: center top` so face is never cropped at any breakpoint
  - Caption: "PRINCE ZYRUS NATIVIDAD · TARLAC, PH"
  - Alt text: "Portrait of Prince Zyrus Natividad"
  - Original hairline frame, corner brackets, folio styling preserved
  - Hover label `[ ZYRUS // ONLINE ]` with green status dot (desktop only)

- **Resume header**: Added 72×72px square portrait with hairline border alongside name/contact block
  - Print-safe: photo is retained at 60px, grayscale off, never causes a second page
  - `print-color-adjust: exact` applied

- **Social / Open Graph card** (`public/img/og-card.jpg`):
  - 1200×630px, `#ECEAE4` background
  - Portrait cropped to square on left with hairline frame
  - Name "Prince Zyrus Natividad", role "Builder & Opinion Editor" in site fonts
  - "ZYRUS // SYSTEMS ARCHITECTURE" in monospace, green status dot
  - Added meta tags: `og:image`, `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`
  - Added `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`
  - Added `<link rel="canonical" href="https://zyrus.dpdns.org">`
  - OG description uses existing site copy from hero paragraph

- **Favicon set**:
  - `portrait-32.png` → `<link rel="icon">`
  - `portrait-180.png` → `<link rel="apple-touch-icon">`
  - `portrait-512.png` → web manifest icon (maskable)
  - Created `public/site.webmanifest`
  - Face clearly legible at 32px (professional headshot with dark background)

**Portrait Motion** (same system as rest of site — GSAP + ScrollTrigger)
- Frame border draw: animates from transparent to `#D8D3C8` when section enters viewport (0.5s)
- Reveal: clip-path wipe `inset(100% 0 0 0)` → `inset(0% 0 0 0)` (900ms, power4.out / ease-out-expo) with simultaneous scale 1.06→1.0
- Parallax: `y: -24px` scrub on desktop only (GSAP ScrollTrigger scrub)
- Hover: `[ ZYRUS // ONLINE ]` label fades in with green dot (CSS group-hover, 250ms)
- Reduced motion (`prefers-reduced-motion: reduce`): all animations disabled, image simply visible
- Mobile (`<1024px`): fade-in crossfade only, no wipe/parallax/scale
- LCP guard: image forced visible within 2.5s regardless of connection speed

**Meta / Manifest**
- Added `public/site.webmanifest` with icon set
- Added `<link rel="manifest">` to `<head>`

**Build**
- `npm run build` ✅ succeeds — 95.51KB HTML, 22.47KB CSS, 146.71KB JS (gzipped)
- No console errors expected
- Added `npm run process-portrait` script alias

**Notes**
- Portrait quality: high — suitable for all placements (no blurriness, adequate size)
- Face position: centered horizontally, upper ~55% of frame — face fully visible at all breakpoints without `object-position` adjustment needed beyond `center top`
- No retouching, filtering, recoloring or beautification was performed — only resize and compress

---

## [Phase 4] — 2026-10-03 · Previous Commits

### Final Polish and Handoff (6faf4cc)
- Full site Polish pass; complete responsive layout

### Motion & Animation Implementation (310ee04)
- GSAP ScrollTrigger integration
- Lenis smooth scroll
- Hero reveals, section reveals, stagger animations
- Custom cursor (desktop)

### Content Architecture & Corrections (759c1d3)
- site.json single source of truth
- hydrate.js injection system

### Phase 1: Styles & Dead Code Removal (6d3e299)
- Tailwind config with design tokens
- main.css extraction
