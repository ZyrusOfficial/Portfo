ROLE & GOAL
Upgrade an existing, approved portfolio design into a polished, production-ready static website with beautiful, restrained motion design and real interactivity. Site: "Prince Zyrus Natividad | Builder & Opinion Editor". Brand: "ZYRUS // SYSTEMS ARCHITECTURE". Domain: zyrus.dpdns.org.

REFERENCES (attached)
- code.html + screen.png: the approved Stitch design. The visual design is FINAL. Preserve layout, palette, typography, spacing and copy tone exactly.
- DESIGN.md: design tokens. Colors: ground #ECEAE4, card #F5F3EC, inset #E2DED5, hairline #D8D3C8, hairline-hover #BDB6A5, ink #1C1B1A, ink-muted #5C5854, ink-subtle #8A847C, terracotta #9A5B32, status-green #3F6E4C. Fonts: Inter (UI), JetBrains Mono (labels), Newsreader (serif, editorial titles). 12-column Swiss grid, max-width 1240px, 1px hairlines, mono bracket labels, folios, REF codes.

STEP 0: PLAN FIRST
Before writing code, produce an Implementation Plan and Task List: (1) an audit of code.html (sections, existing JS/CSS animations, issues), (2) the proposed file structure, (3) phased milestones with acceptance tests. Then execute phase by phase, stopping after each phase for review. `git init` and commit after each phase with a clear message, on a branch named `motion-v1`.

NON-NEGOTIABLES
- Do not redesign. No new colors, no gradients, no dark mode, no pure white, no stock imagery, no emoji. Motion is precise and instrument-like: never bouncy, never flashy.
- Do not invent content. Use only the content in code.html plus the corrections below. Anything missing stays a labeled mono placeholder such as [ DATE ].
- Performance: animate only transform, opacity, clip-path and SVG stroke-dashoffset. No layout-thrashing animation. Targets on mobile Lighthouse: Performance >= 90, Accessibility >= 95, CLS near 0.
- Accessibility: full support for prefers-reduced-motion (disable smooth scroll, parallax, cursor effects, text reveals, loops; show final static states), visible focus rings, keyboard operability everywhere, semantic landmarks, a skip-to-content link, and aria labels or alt text on diagrams.
- No external requests except fonts. Self-host Inter, JetBrains Mono and Newsreader with font-display: swap.

ARCHITECTURE
Convert the single Tailwind-CDN HTML into a small static project that builds to plain files deployable on Vercel or Cloudflare Pages:
- Vite + vanilla JS (ES modules) + compiled Tailwind (replicate the theme config from code.html exactly).
- GSAP + ScrollTrigger for scroll motion; Lenis for smooth scroll. Use GSAP SplitText if the installed version includes it, otherwise write a small word/line splitter.
- Structure: /src/main.js, /src/motion/{tokens,intro,scroll,hover,cursor,text,svg}.js, /src/features/{clock,contact,nav,tags}.js, /src/styles/*.css, /content/site.json (all copy, so text is editable in one place), /public.
- Use hash-anchor navigation only. No client-side router. No article or case-study reader pages in this version.

CONTENT CORRECTIONS (apply while porting; list every change in a CHANGELOG)
1. Recognition ledger: remove the "DIVISION" tags on the MSSPC items, because the level was never stated. Show no level tag on those items. Keep NATIONAL on the two national items. Do not expand MSSPC or DSPC. Keep the [ DATE ] placeholders. The Rotary line must read "Rotary Regional Training (Participation)", not "Youth Leadership Training". Remove the footnote about "authentic accreditation".
2. Writing section: delete the three invented column titles ("Monsoon Preparedness...", "Small-Scale Logistics...", "Regional Supply Chains..."). Replace them with two placeholder rows built from the same component: "[ COLUMN TITLE ]", [ DATE ], topic tag. Keep the featured card titled "Questions Behind the Chips: The Pax Silica Microchip Initiative in Capas", and replace its invented summary with "[ SUMMARY ]". Keep the IMRAD paper card with its full title "Deployable Real-Time Non-Contact Flood Monitoring System Using Computer Vision and Decentralized Multi-Path Communication Network" and replace its description with "[ SUMMARY ]". Read/paper links: render a "READ ↗" link that opens in a new tab ONLY if an item in /content/site.json has a non-empty `url`; otherwise render nothing (no dead buttons, no "coming soon" clutter).
3. Remove invented claims: "mentoring staff writers" and "directing editorial agendas" (say: Opinion Editor and former Managing Editor of the campus publication; main opinion writer); the 44-day curriculum description must read "a structured 44-day journalism and English writing curriculum for his younger sister" (remove "editorial ethics", "headline construction"); replace "RF Circuitry" with "Electronics & embedded systems"; the mung bean study is about the effect of coconut husk ash on plant height growth (remove "nutrient absorption"); replace "field deployment trials across flood-prone municipalities" with "seeking funding or scholarship support for the flood-monitoring prototype".
4. Clock: compute Philippine time with Intl.DateTimeFormat and timeZone "Asia/Manila", labeled "PHT (UTC+8)". The current code labels local time as UTC, which is wrong.
5. Contact: use princezyrusnatividad@gmail.com everywhere the "[ EMAIL ]" placeholder appears (contact section, resume header, footer), with a copy-to-clipboard button and a micro-toast reading "COPIED". Assemble the address in JS at runtime so it isn't trivially scraped, while the mailto: fallback still works without JavaScript. Make the form real: read an endpoint from the env variable VITE_FORM_ENDPOINT and POST JSON to it with fetch (designed for Formspree or Web3Forms). If the variable is unset, fall back to opening a mailto: link with the fields prefilled and show a clear message saying so. Add client-side validation, a honeypot field, a disabled state while sending, and success/error states styled "TRANSMISSION ACKNOWLEDGED" / "TRANSMISSION FAILED, RETRY". Never show a fake success.

REMOVALS (Stitch left these in; take them out completely)
- Delete the rhythm-simulator modal (#modal-modal-rhythm) and all of its markup, CSS and JS.
- Delete the "[ SEKAI // 4K ]" button from the top status bar, along with its toggleModal handler.
- Delete the Konami-code listener and any hint to it.
- Keep the "07 / BEYOND THE SCREEN" section's text about rhythm games and music exactly as written; only the interactive game goes away.
- Leave no dead code, orphaned styles or unused IDs behind, and list these removals in the CHANGELOG.

MOTION SYSTEM
Tokens (define once, reuse everywhere):
- Easings: ease-out-expo cubic-bezier(0.16, 1, 0.3, 1) as the default; cubic-bezier(0.65, 0, 0.35, 1) for state transitions.
- Durations: micro 180-250ms, standard 500-700ms, hero/intro 900-1200ms. Stagger 50-80ms. Reveal offset 16-24px.
- Rule: every motion must communicate structure (draw, reveal, sequence, signal), never just decorate.

Choreography:
1. Intro (first load only, under 1.6s in total, skippable by any input, skipped entirely under reduced motion): hairlines draw left to right; masthead fades down; the status dot pulses; folio numbers tick in.
2. Hero: the headline "Code. Circuits. Columns." reveals word by word with a masked upward slide; "Columns." lands last with a soft terracotta underline draw. Subhead fades up. The spec-sheet rows type in like telemetry with the blinking mono cursor. The node-topology SVG draws stroke by stroke, then the nodes pulse softly. Chips and CTAs stagger in.
3. Section entry (ScrollTrigger, once): the folio label and hairline draw first, then the heading with a masked line reveal, then the content in a stagger.
4. Smooth scroll with Lenis (lerp about 0.09). Anchor links scroll with an eased offset for the sticky header. Subtle parallax (max 40px) on the hero and diagram backgrounds only.
5. Masthead: after 80px of scroll it tightens (height, border, blur) smoothly; a 2px terracotta scroll-progress line runs along its bottom edge; the nav has an active-section indicator that slides between links (scrollspy).
6. Stats: replace the setInterval count-up with GSAP-driven counters that ease out.
7. Capabilities bento: staggered reveal; hover lifts 3px and shifts the border to hairline-hover; the layer tags (PHYSICAL / APPLICATION / NETWORK) brighten. Hovering a tech tag highlights the same tag everywhere on the page (data-driven from /content/site.json), so visitors see which projects use which tools.
8. Work dossiers: on entry the PROBLEM block frames in first, then ACTION, then RESULT. Diagrams animate signal flow along the wires with terracotta dashes as they scroll into view; the trading-pipeline NB0 to NB8 nodes light up in sequence; the Hat-a-See diagram pulses its vibration output in proportion to a simulated obstacle distance. INDEX table rows keep the existing 6px shift and terracotta left border on hover, and expand in place on click to show their details (keyboard accessible, aria-expanded, animated height via grid-template-rows).
9. Writing: cards reveal in a stagger; hover style matches the bento cards.
10. Journey: the vertical timeline progress line fills with scroll and the active node scales up; the recognition ledger rows reveal one by one with a hairline draw.
11. Resume: the paper-like card slides up into place and its sections reveal. Keep [ DOWNLOAD PDF / PRINT ] opening the print dialog. The print stylesheet stays clean, one page, no animation.
12. Buttons: magnetic pull within about 60px on primary CTAs (desktop only) plus a fill-sweep on hover. Keep the custom cursor (dot + ring) but drive it from one requestAnimationFrame loop with lerp; it grows over interactive elements.

OTHER INTERACTIVITY
- Mobile: full-screen menu with staggered link reveal, sticky bottom CTA, larger tap targets, and simplified motion (fades and short slides only; no cursor, parallax or magnetic effects).
- Anchor navigation updates the URL hash without a jump, and the back button behaves sensibly.

QUALITY GATES (verify with the browser agent and attach screenshots or recordings as artifacts)
1. Test at 1440, 1024, 768 and 390 px widths: no horizontal scroll, no overlap, no clipped text.
2. Emulate prefers-reduced-motion: reduce and confirm all motion is off and all content is visible.
3. Keyboard-only walkthrough: tab through nav, cards, INDEX rows and the form; focus is always visible and never lost.
4. Submit the contact form with VITE_FORM_ENDPOINT unset and confirm the mailto: fallback and its message; then validate the error states.
5. Run Lighthouse (mobile), report the scores, and fix anything below target.
6. Print preview of the resume is one clean page.
7. Console has zero errors or warnings; `npm run build` succeeds and outputs a deployable /dist.

DELIVERABLES
The working Vite project; a README covering how to run it, where to edit copy in /content/site.json, how to set VITE_FORM_ENDPOINT, and how to deploy to Vercel or Cloudflare Pages; the git history by phase; and a CHANGELOG listing every content correction and removal. If any instruction conflicts with the approved design, keep the design and say so in the summary.