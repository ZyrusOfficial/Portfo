import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { getMotionConfig, isMotionEnabled } from './config.js';

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  const motionEnabled = isMotionEnabled();
  
  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smoothWheel: true,
  });

  // Synchronize GSAP ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  if (!motionEnabled) {
    // Basic fallback for reduced motion: initialize portrait loading logic only
    initPortraitMotion(false, null);
    return;
  }

  const config = getMotionConfig();
  const easeOutExpo = 'expo.out';

  // 2. Hero Reveal Animation
  const heroHeading = document.querySelector('h1[data-animate="hero"]');
  if (heroHeading) {
    // Manually split hero heading into words for animation
    const content = heroHeading.innerHTML;
    // Basic split (not robust for all HTML, but works for the known structure: "Code. Circuits. <br /> <span>Columns.</span>")
    heroHeading.innerHTML = `
      <span class="inline-block hero-word">Code.</span> 
      <span class="inline-block hero-word">Circuits.</span> <br />
      <span class="inline-block hero-word text-terracotta font-serif font-normal italic relative">
        Columns.
        <span class="hero-underline absolute bottom-0 left-0 w-full h-[3px] bg-terracotta" style="transform-origin: left;"></span>
      </span>
    `;

    const words = heroHeading.querySelectorAll('.hero-word');
    gsap.fromTo(words, 
      { yPercent: 110, rotation: 7, scale: 0.9, opacity: 0 },
      { yPercent: 0, rotation: 0, scale: 1, opacity: 1, duration: config.durations.base, stagger: config.stagger, ease: easeOutExpo, delay: 0.2 }
    );
    
    const underline = heroHeading.querySelector('.hero-underline');
    if (underline) {
      gsap.fromTo(underline, 
        { scaleX: 0 }, 
        { scaleX: 1, duration: config.durations.base, ease: easeOutExpo, delay: 0.2 + (words.length * config.stagger) }
      );
    }
  }

  const otherHeroEls = document.querySelectorAll('[data-animate="hero"]:not(h1)');
  if (otherHeroEls.length) {
    gsap.fromTo(otherHeroEls, 
      { y: config.heroOffset, scale: 0.96, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: config.durations.base, stagger: config.stagger, ease: easeOutExpo, delay: 0.3 }
    );
  }

  // 3. Scroll Reveal — animate the inner content container, NOT the <section> itself.
  // Animating the <section> would hide ghost numerals (prepended children) and
  // break scanner bars (position:absolute relative to the section).
  const sections = document.querySelectorAll('section:not(#hero)');
  sections.forEach(section => {
    // Target first direct child that is not the ghost numeral
    const inner = section.querySelector(':scope > *:not(.section-ghost-numeral)');
    if (!inner) return;
    gsap.set(inner, { y: config.revealOffset, scale: 0.96, opacity: 0 });
    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(inner, {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: config.durations.base,
          ease: easeOutExpo
        });
      }
    });
  });

  // 4. Staggered reveals for lists
  const staggerContainers = document.querySelectorAll('[data-animate="stagger-container"]');
  staggerContainers.forEach(container => {
    const items = container.querySelectorAll('[data-animate="stagger-item"]');
    if (items.length) {
      gsap.set(items, { y: config.revealOffset, scale: 0.96, opacity: 0 });
      ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            y: 0, 
            scale: 1,
            opacity: 1, 
            duration: config.durations.fast, 
            stagger: config.stagger,
            ease: easeOutExpo
          });
        }
      });
    }
  });

  // 5. Portrait Motion System
  initPortraitMotion(true, config);
}

function initPortraitMotion(motionEnabled, config) {
  const frame = document.getElementById('portrait-frame');
  const clip = document.getElementById('portrait-clip');
  const img = document.getElementById('portrait-img');
  const placeholder = document.getElementById('portrait-placeholder');
  const parallax = document.getElementById('portrait-parallax');

  if (!frame || !clip || !img) return;

  function revealSharpImage() {
    if (placeholder) placeholder.style.opacity = '0';
    img.style.opacity = '1';
  }

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

  if (!motionEnabled) {
    img.style.opacity = '1';
    if (placeholder) placeholder.style.opacity = '0';
    return;
  }

  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  if (!isDesktop) return;

  const easeOutExpo = 'expo.out';

  gsap.fromTo(frame,
    { borderColor: 'rgba(216, 211, 200, 0)' },
    {
      borderColor: 'rgba(216, 211, 200, 1)',
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: frame,
        start: 'top 80%',
        once: true
      }
    }
  );

  gsap.set(clip, { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(img, { scale: 1.06, opacity: 0 });

  gsap.timeline({
    scrollTrigger: {
      trigger: frame,
      start: 'top 78%',
      once: true
    }
  })
  .to(img, { opacity: 1, duration: 0.1 }, 0)
  .to(clip, { clipPath: 'inset(0% 0 0 0)', duration: config.durations.base, ease: easeOutExpo }, 0.25)
  .to(img, { scale: 1, duration: config.durations.base, ease: easeOutExpo }, 0.25);

  gsap.to(parallax, {
    y: -config.parallax.content,
    ease: 'none',
    scrollTrigger: {
      trigger: frame,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });
}
