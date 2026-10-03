# Motion Audit Report

1. **prefers-reduced-motion:**
   - **Cause:** The `prefers-reduced-motion` media query is only checked and respected within the `initPortraitMotion()` function. The rest of the animations (hero reveal, sections, and staggered lists) completely ignore the user's motion preferences.

2. **Lenis and ScrollTrigger:**
   - **Cause:** Lenis is being updated twice per frame. It is connected to GSAP's ticker (`gsap.ticker.add`) while simultaneously running its own native `requestAnimationFrame(raf)` loop. This causes race conditions and jitter. `lagSmoothing(0)` is correctly configured, but the double loop breaks the smoothness.

3. **Scroll triggers firing (Start Positions & Initial States):**
   - **Cause:** 
     - Using `toggleActions: 'play none none none'` instead of `once: true`.
     - Elements already in view on load might fail to trigger if they don't cross the `start: 'top 85%'` threshold.
     - The use of `gsap.fromTo` on elements already rendered in their final state without proper initial hidden states can lead to them staying hidden or jumping.

4. **Overflow and Contain Styles:**
   - **Cause:** The `body` element has `overflow-x: hidden` which can clip horizontal animations. Some containers (like `portrait-clip-wrapper`) use `overflow-hidden`, which clips any scale or transform motion that exceeds the container boundaries.

**Resolution:**
These issues will be fixed by implementing a centralized `config.js` that checks for `prefers-reduced-motion` globally, removing the redundant Lenis RAF loop, fixing ScrollTrigger configurations, and removing restrictive overflow rules where they break animations.
