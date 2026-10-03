FOLLOW-UP: MOTION INTENSITY UPGRADE + INTERACTIVE DOT GRID

Context: This continues the existing project. The design stays FINAL (same palette, layout, copy, fonts). Create branch `motion-v2` from the latest work. The owner finds the current animations too small, too subtle, or invisible. Make motion clearly visible and expressive while staying elegant: warm-stone editorial, no neon, no gradients, no bounce or elastic easings.

STEP 0: AUDIT FIRST (before changing anything)
Find out why some animations are weak or missing. Check and report on each:
1. Is a prefers-reduced-motion rule, in CSS or JS, being matched or applied by mistake?
2. Is Lenis connected to ScrollTrigger (lenis.on('scroll', ScrollTrigger.update), a raf ticker through gsap.ticker, and lagSmoothing(0))?
3. Are scroll triggers firing at all? Elements already in view on load, `once: true` combined with wrong start positions, hidden initial states never set (gsap.from on elements that already render in final state), opacity-only tweens with no travel.
4. Are any animated elements wrapped in overflow or contain styles that clip or cancel the motion?
Produce a short audit report listing every weak or non-functional animation and the cause, then fix the causes.

STEP 1: CENTRAL MOTION CONFIG
Create /src/motion/config.js with a single INTENSITY multiplier and three presets: "calm" (the old values), "expressive" (DEFAULT) and "bold". Every motion value (offsets, durations, staggers, parallax depth, hover lift, magnetic range, tilt angle, marquee speed, dot-grid radius) must read from this config so the owner can change one line to dial motion up or down. Document it in the README.

Expressive preset (default) values:
- Reveal offset: 56-80px (hero 120px) plus scale 0.96 to 1.0; durations 900-1400ms; stagger 110-160ms; ease-out-expo for reveals.
- Hover lift: 10px with a soft warm shadow (rgba(28,27,26,0.08), blur 24px); border to hairline-hover.
- Parallax: three depth layers (background elements 140px, mid 90px, content 40px), desktop only.
- Magnetic buttons: 110px range, pull strength 0.4.
- Cursor: terracotta dot plus a 44px trailing ring that expands to 72px over interactive elements and becomes a small "VIEW" or arrow label over project cards.
- Intro: up to 2.4s, skippable by any input: hairlines sweep, a mono counter runs 000 to 100, then the masthead and hero rise in.
- Hero headline: each word rises from 110% with a small rotation (6-8deg) and scale, 130ms stagger; "Columns." lands last with a terracotta underline draw.
- Diagram wires and node pulses loop slowly after they first appear (not only on scroll).
- Counters: 2.2s ease-out.
Only animate transform, opacity, clip-path and SVG stroke-dashoffset. Do not animate layout properties or use filter blur.

STEP 2: INTERACTIVE DOT GRID (signature effect)
Build /src/features/dotgrid.js: a single fixed full-viewport <canvas> behind all content (z-index 0, pointer-events: none, content above it). Dots sit on an invisible regular grid and are revealed by interaction.
Grid:
- Spacing 26px on desktop (>= 1024px), 22px on mobile. Dot base radius 1.1px, color ink #1C1B1A.
- At rest the grid is nearly invisible: ambient opacity 0.05 on desktop (a ghost texture), 0 on touch devices.
Desktop pointer behavior:
- Within a 170px radius of the cursor, dots grow (radius 1.1 to 3.4px), brighten (opacity up to 0.85) and shift color from ink toward terracotta #9A5B32 (up to 70% at the center), with smooth falloff (ease-out cubic).
- Dots are gently pushed away from the pointer (max 10px) using spring physics (stiffness ~0.12, damping ~0.82) so they settle back like a soft fluid.
- Faster cursor movement enlarges the influence radius up to 1.5x.
Touch behavior (must feel great on a phone):
- Dots appear wherever the finger touches. On touchstart/pointerdown the grid reveals in a 130px radius around the touch point, follows the finger during touchmove, and fades out over about 700ms after release, leaving a short decaying trail.
- Support multiple simultaneous touches.
- Use passive listeners and never call preventDefault; scrolling and taps on links must work normally (do not change touch-action).
Click/tap ripples:
- On click or tap, emit a ripple ring from that point: speed ~600px/s, ring width ~90px; dots on the ring pulse to 2.2x size and push outward 14px; the ring fades over about 1.2s. Maximum 6 concurrent ripples.
Scroll reaction:
- While scrolling, add a vertical wave displacement to visible dots proportional to scroll velocity (phase offset by row, clamped to 6px) that settles when scrolling stops.
Visibility rules:
- Dots draw only on the page ground and in the section gutters. Cards stay opaque. Give the hero, contact and "Beyond the Screen" sections transparent backgrounds so more of the grid shows there.
Performance:
- One canvas, devicePixelRatio capped at 2. Keep per-dot state in typed arrays and only update and draw dots inside the active influence bounding boxes; skip everything else. Stop the animation loop after 1s of inactivity and clear; restart on input. Pause on visibilitychange. Debounce resize. Hold 60fps on a mid-range phone (test with 4x CPU throttle in the browser agent).
Fallbacks:
- Reduced motion or the Motion toggle off: no displacement, no ripples, no pointer reveal; show only a static faint dot texture at 0.06 opacity (a CSS background-image dot pattern is acceptable here).

STEP 3: NEW SIGNATURE EFFECTS
1. Ghost section numerals: huge outlined folio numbers (01-07) in hairline stroke behind each section heading, drifting 120px with scroll.
2. Text decode: mono labels (folios, status rows, tags) scramble through random characters and resolve to the real text on entry and on hover (400-700ms). Real text must stay in the DOM for screen readers (aria-label), and nothing may shift layout.
3. Tag marquee strip between Hero and Story: EMBEDDED / LINUX / LOCAL AI / ALGO TRADING / JOURNALISM / HARDWARE, in mono, infinite horizontal loop whose speed and direction react to scroll velocity; pause on hover; static on reduced motion.
4. Pinned scroll story (desktop >= 1024px only) for the three featured project dossiers: pin each dossier while scroll scrubs PROBLEM, then ACTION, then RESULT in sequence, with the diagram drawing in sync. Mobile and reduced motion fall back to the normal stacked layout.
5. 3D tilt on Work dossier cards and capability cards: max 5 degrees, perspective 900px, smoothed, resets on leave; desktop only.
6. Click feedback: a terracotta ring ripple on buttons at the click point, in addition to the dot-grid ripple.
7. Section transitions: as each section enters, a terracotta hairline "scanner" sweeps across its top edge once, then content reveals.
8. Mobile menu: full-screen curtain wipe, links rise with 120ms stagger.

STEP 4: MOTION TOGGLE
Add a small mono control in the masthead (and footer): "MOTION: ON / OFF". It defaults to ON unless prefers-reduced-motion is set (then defaults to OFF). Persist the choice in localStorage inside try/catch. When OFF, behave exactly like reduced motion.

QUALITY GATES (verify with the browser agent; attach screen recordings)
1. Add a Playwright (or equivalent) check that proves motion is visible: for 6 representative elements (hero headline word, a bento card, a project dossier, a stat counter, a timeline node, the marquee), sample getBoundingClientRect or transform at t=0 and t=400ms after entering the viewport and assert displacement >= 40px or opacity change >= 0.5. Fail the build report if not met.
2. Record 10-second videos showing: the intro, hero reveal, dot grid with mouse, dot grid with touch emulation (tap and drag), scroll wave, ripple, marquee reacting to scroll, pinned story, tilt.
3. Touch test at 390px: scrolling is never blocked; links and form fields work; dots appear at the touch point and fade after release.
4. Reduced motion and Motion OFF: all of the above disabled, all content visible, static dot texture only.
5. Lighthouse mobile: Performance >= 85 (the dot grid may cost a few points; report scores) and CLS near 0; no console errors; `npm run build` succeeds.
6. Report CPU usage while idle: the dot grid loop must be stopped when nothing is happening.

DELIVERABLES
Updated project on branch motion-v2, README section on config.js presets and how to change intensity, the audit report, and a CHANGELOG entry. If any instruction conflicts with the approved design, keep the design and say so.