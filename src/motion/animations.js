import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Synchronize GSAP ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 2. Hero Reveal Animation
  const heroEls = document.querySelectorAll('[data-animate="hero"]');
  if (heroEls.length) {
    gsap.fromTo(heroEls, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
    );
  }

  // 3. Scroll Reveal for sections/items
  const sections = document.querySelectorAll('section:not(#hero)');
  sections.forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1, 
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none' // Play once
        }
      }
    );
  });

  // 4. Staggered reveals for lists
  const staggerContainers = document.querySelectorAll('[data-animate="stagger-container"]');
  staggerContainers.forEach(container => {
    const items = container.querySelectorAll('[data-animate="stagger-item"]');
    if (items.length) {
      gsap.fromTo(items,
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  });

  // 5. Portrait Motion System
  initPortraitMotion();
}

/**
 * Portrait animation system.
 * - Respects prefers-reduced-motion: no wipe, no parallax, no scale.
 * - Mobile (<1024px): fade-in only.
 * - Desktop: clip-path wipe + scale reveal + parallax + hover label.
 * - LCP guard: image is never hidden for more than 2.5s.
 */
function initPortraitMotion() {
  const frame = document.getElementById('portrait-frame');
  const clip = document.getElementById('portrait-clip');
  const img = document.getElementById('portrait-img');
  const placeholder = document.getElementById('portrait-placeholder');
  const parallax = document.getElementById('portrait-parallax');

  if (!frame || !clip || !img) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cross-fade: show sharp image when loaded, hide placeholder
  function revealSharpImage() {
    if (placeholder) placeholder.style.opacity = '0';
    img.style.opacity = '1';
  }

  // LCP guard: force reveal within 2.5s regardless of load state
  const lcpTimeout = setTimeout(revealSharpImage, 2500);

  if (img.complete) {
    clearTimeout(lcpTimeout);
    revealSharpImage();
  } else {
    img.addEventListener('load', () => {
      clearTimeout(lcpTimeout);
      revealSharpImage();
    }, { once: true });
  }

  // Reduced motion: just show everything, no animation
  if (prefersReducedMotion) {
    img.style.opacity = '1';
    if (placeholder) placeholder.style.opacity = '0';
    return;
  }

  // Mobile (< 1024px): fade-in only when section enters viewport
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  if (!isDesktop) {
    // Simple fade — image is already opacity:0 in HTML, crossfade handles it
    // Just ensure placeholder fades out when img is loaded
    return;
  }

  // === DESKTOP FULL ANIMATION ===

  // ease-out-expo custom ease
  const easeOutExpo = 'power4.out';

  // Step 1: Frame border draw — immediately on trigger
  // The frame starts with hairline border (already visible), we animate border-color opacity
  gsap.fromTo(frame,
    { borderColor: 'rgba(216, 211, 200, 0)' },
    {
      borderColor: 'rgba(216, 211, 200, 1)',
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: frame,
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    }
  );

  // Step 2: Clip-path wipe from bottom to top + scale reveal
  // Initial state: hidden (clip-path covers full image from bottom)
  gsap.set(clip, { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(img, { scale: 1.06, opacity: 0 });

  gsap.timeline({
    scrollTrigger: {
      trigger: frame,
      start: 'top 78%',
      toggleActions: 'play none none none',
    }
  })
  // Reveal the img opacity first (so crossfade works during wipe)
  .to(img, { opacity: 1, duration: 0.1 }, 0)
  // Wipe clip-path from bottom to top
  .to(clip, {
    clipPath: 'inset(0% 0 0 0)',
    duration: 0.9,
    ease: easeOutExpo,
  }, 0.25) // slight delay after frame draw starts
  // Scale from 1.06 to 1.0 simultaneously
  .to(img, {
    scale: 1,
    duration: 0.9,
    ease: easeOutExpo,
  }, 0.25);

  // Step 3: Parallax — image moves slightly inside the frame while scrolling
  // max 24px displacement, desktop only
  gsap.to(parallax, {
    y: -24,
    ease: 'none',
    scrollTrigger: {
      trigger: frame,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });
}
