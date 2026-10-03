/**
 * signature-effects.js
 * Implements all Step 3 signature effects:
 *  1. Ghost section numerals (folio numbers)
 *  2. Text decode (mono labels scramble on entry + hover)
 *  3. Tag marquee strip (between Hero and Story)
 *  4. Pinned scroll story for 3 dossiers (desktop only)
 *  5. 3D tilt on work & capability cards (desktop only)
 *  6. Click feedback: terracotta ring ripple on buttons
 *  7. Section scanner: terracotta hairline sweeps across section top
 *  8. Mobile menu: full-screen curtain wipe + staggered links
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isMotionEnabled } from '../motion/config.js';

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// 1. GHOST SECTION NUMERALS
// ─────────────────────────────────────────────
export function initGhostNumerals() {
  const sections = [
    { id: 'story',        num: '01' },
    { id: 'capabilities', num: '02' },
    { id: 'work',         num: '03' },
    { id: 'writing',      num: '04' },
    { id: 'lab',          num: '05' },
    { id: 'journey',      num: '06' },
    { id: 'resume',       num: '07' },
  ];

  sections.forEach(({ id, num }) => {
    const section = document.getElementById(id);
    if (!section) return;

    // Make section position:relative if not already
    section.style.position = 'relative';
    // Use overflow-x:clip (not overflow:hidden) so GSAP vertical reveals
    // (y transforms) are never clipped. Only horizontal overflow is masked.
    section.style.overflowX = 'clip';

    const ghost = document.createElement('span');
    ghost.className = 'section-ghost-numeral';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.textContent = num;
    Object.assign(ghost.style, {
      position: 'absolute',
      top: '-0.15em',
      left: '-0.05em',
      fontSize: 'clamp(8rem, 20vw, 18rem)',
      fontFamily: 'monospace',
      fontWeight: '700',
      lineHeight: '1',
      color: 'transparent',
      WebkitTextStroke: '1px rgba(28,27,26,0.07)',
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: '0',
      willChange: 'transform',
    });
    section.prepend(ghost);

    if (!isMotionEnabled()) return;

    gsap.to(ghost, {
      y: -120,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });
}

// ─────────────────────────────────────────────
// 2. TEXT DECODE
// ─────────────────────────────────────────────
const DECODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';

function runDecode(el, originalText, durationMs = 600) {
  let frame = 0;
  const totalFrames = Math.round(durationMs / 1000 * 60);
  const len = originalText.length;

  function tick() {
    const progress = frame / totalFrames;
    const resolvedCount = Math.floor(progress * len);
    let display = '';
    for (let i = 0; i < len; i++) {
      if (originalText[i] === ' ') { display += ' '; continue; }
      if (i < resolvedCount) {
        display += originalText[i];
      } else {
        display += DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
      }
    }
    el.textContent = display;
    frame++;
    if (frame <= totalFrames) requestAnimationFrame(tick);
    else el.textContent = originalText;
  }
  requestAnimationFrame(tick);
}

export function initTextDecode() {
  const targets = document.querySelectorAll('[data-decode]');
  targets.forEach(el => {
    const originalText = el.getAttribute('aria-label') || el.textContent;
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', originalText);

    if (isMotionEnabled()) {
      // Entry decode via IntersectionObserver
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          runDecode(el, originalText);
          observer.disconnect();
        }
      }, { threshold: 0.5 });
      observer.observe(el);

      // Hover decode
      el.addEventListener('mouseenter', () => runDecode(el, originalText, 400));
    }
  });
}

// ─────────────────────────────────────────────
// 3. TAG MARQUEE STRIP
// ─────────────────────────────────────────────
export function initMarquee() {
  const placeholder = document.getElementById('marquee-placeholder');
  if (!placeholder) return;

  const items = ['EMBEDDED', 'LINUX', 'LOCAL AI', 'ALGO TRADING', 'JOURNALISM', 'HARDWARE'];
  const reduced = !isMotionEnabled();

  // Build strip
  const strip = document.createElement('div');
  strip.id = 'marquee-strip';
  strip.setAttribute('aria-hidden', 'true');
  Object.assign(strip.style, {
    overflow: 'hidden',
    borderTop: '1px solid #D8D3C8',
    borderBottom: '1px solid #D8D3C8',
    background: '#F5F3EC',
    padding: '10px 0',
    position: 'relative',
    zIndex: '1',
  });

  if (reduced) {
    // Static version
    strip.style.display = 'flex';
    strip.style.flexWrap = 'wrap';
    strip.style.gap = '24px';
    strip.style.padding = '10px 24px';
    items.forEach(item => {
      const span = document.createElement('span');
      span.className = 'font-mono text-xs tracking-widest text-ink-muted uppercase';
      span.textContent = item;
      strip.appendChild(span);
    });
    placeholder.replaceWith(strip);
    return;
  }

  // Animated version – duplicate items to fill
  const track = document.createElement('div');
  Object.assign(track.style, {
    display: 'flex',
    width: 'max-content',
    willChange: 'transform',
  });

  // Repeat items multiple times for seamless loop
  const repeats = 6;
  for (let r = 0; r < repeats; r++) {
    items.forEach(item => {
      const span = document.createElement('span');
      Object.assign(span.style, {
        fontFamily: 'monospace',
        fontSize: '11px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#5C5854',
        padding: '0 32px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      });
      span.textContent = item;
      track.appendChild(span);
    });
  }

  strip.appendChild(track);
  placeholder.replaceWith(strip);

  // Base speed
  let speed = 1; // px per frame
  let dir = -1;
  let scrollVel = 0;
  let lastScroll = window.scrollY;
  let paused = false;

  strip.addEventListener('mouseenter', () => { paused = true; });
  strip.addEventListener('mouseleave', () => { paused = false; });

  window.addEventListener('scroll', () => {
    scrollVel = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
  }, { passive: true });

  let x = 0;
  const singleSetWidth = () => track.scrollWidth / repeats;

  function animate() {
    if (!paused) {
      const scrollBoost = scrollVel * 0.4;
      scrollVel *= 0.92;
      const effectiveSpeed = speed + Math.abs(scrollBoost);
      const effectiveDir = scrollBoost < -0.5 ? 1 : dir;

      x += effectiveSpeed * effectiveDir;

      // Reset for seamless loop
      const sw = singleSetWidth();
      if (x <= -sw) x += sw;
      if (x >= 0) x -= sw;

      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// ─────────────────────────────────────────────
// 4. PINNED SCROLL STORY (Desktop only)
// ─────────────────────────────────────────────
export function initPinnedStory() {
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  if (!isDesktop || !isMotionEnabled()) return;

  // Look for dossier articles with data-pinned-story attribute
  const dossiers = document.querySelectorAll('[data-pinned-story]');
  dossiers.forEach(dossier => {
    const problem = dossier.querySelector('[data-story-problem]');
    const action  = dossier.querySelector('[data-story-action]');
    const result  = dossier.querySelector('[data-story-result]');
    if (!problem || !action || !result) return;

    gsap.set([action, result], { opacity: 0, y: 30 });

    ScrollTrigger.create({
      trigger: dossier,
      pin: true,
      start: 'top top+=80',
      end: '+=600',
      scrub: false,
      onUpdate(self) {
        const p = self.progress;
        // 0–0.33: problem visible
        // 0.33–0.66: action fades in
        // 0.66–1: result fades in
        if (p < 0.33) {
          gsap.to(action, { opacity: 0, y: 30, duration: 0.3 });
          gsap.to(result, { opacity: 0, y: 30, duration: 0.3 });
        } else if (p < 0.66) {
          gsap.to(action, { opacity: 1, y: 0, duration: 0.4 });
          gsap.to(result, { opacity: 0, y: 30, duration: 0.3 });
        } else {
          gsap.to(action, { opacity: 1, y: 0, duration: 0.3 });
          gsap.to(result, { opacity: 1, y: 0, duration: 0.4 });
        }
      }
    });
  });
}

// ─────────────────────────────────────────────
// 5. 3D TILT on cards
// ─────────────────────────────────────────────
export function initTilt() {
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  if (!isDesktop || !isMotionEnabled()) return;

  const MAX_TILT = 5; // degrees
  const PERSPECTIVE = 900;

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.transition = 'transform 0.08s ease-out';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * MAX_TILT;
      const rotY = dx * MAX_TILT;
      card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s ease-out';
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.08s ease-out';
    });
  });
}

// ─────────────────────────────────────────────
// 6. CLICK FEEDBACK — terracotta ring ripple
// ─────────────────────────────────────────────
export function initClickRipple() {
  if (!isMotionEnabled()) return;

  // FIX: Append ripples to body at fixed screen coordinates.
  // This is NEVER clipped by overflow:hidden on buttons/cards.
  function spawnRipple(clientX, clientY) {
    const ripple = document.createElement('span');
    Object.assign(ripple.style, {
      position: 'fixed',
      left: clientX + 'px',
      top:  clientY + 'px',
      width: '0px',
      height: '0px',
      borderRadius: '50%',
      border: '2px solid #9A5B32',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: '9000',       // above all content, below cursor
      opacity: '1',
    });
    document.body.appendChild(ripple);

    gsap.to(ripple, {
      width: 100,
      height: 100,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out',
      onComplete: () => ripple.remove(),
    });
  }

  // Attach to interactive elements — but emit from the CLICK coordinate, not element-relative
  document.querySelectorAll('button, a[href], .ripple-target').forEach(btn => {
    btn.addEventListener('click', e => {
      spawnRipple(e.clientX, e.clientY);
    });
  });
}


// ─────────────────────────────────────────────
// 7. SECTION SCANNER — terracotta hairline sweep
// ─────────────────────────────────────────────
export function initSectionScanner() {
  if (!isMotionEnabled()) return;

  document.querySelectorAll('section[id]').forEach(section => {
    const scanner = document.createElement('div');
    Object.assign(scanner.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '0%',
      height: '2px',
      background: '#9A5B32',
      pointerEvents: 'none',
      zIndex: '2',
      transformOrigin: 'left',
    });

    // Ensure section is positioned
    const pos = window.getComputedStyle(section).position;
    if (pos === 'static') section.style.position = 'relative';
    section.appendChild(scanner);

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.fromTo(scanner,
          { width: '0%', opacity: 1 },
          { width: '100%', duration: 0.7, ease: 'power3.out',
            onComplete: () => gsap.to(scanner, { opacity: 0, duration: 0.3, delay: 0.1 })
          }
        );
      }
    });
  });
}

// ─────────────────────────────────────────────
// 8. MOBILE MENU — curtain wipe + staggered links
// ─────────────────────────────────────────────
export function initMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBtn  = document.getElementById('mobile-menu-btn');
  if (!mobileMenu || !mobileBtn) return;

  const links = mobileMenu.querySelectorAll('a');
  let isOpen = false;

  // Remove the simple hidden/show logic from main.js - replace with GSAP
  // First, remove existing event listeners by cloning the button
  const newBtn = mobileBtn.cloneNode(true);
  mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);

  // Prep menu: initially hidden but measurable
  gsap.set(mobileMenu, { display: 'none', opacity: 0, yPercent: -8 });

  function openMenu() {
    isOpen = true;
    newBtn.textContent = '[ CLOSE ]';
    gsap.set(mobileMenu, { display: 'block' });
    if (isMotionEnabled()) {
      gsap.set(links, { y: 20, opacity: 0 });
      gsap.to(mobileMenu, { opacity: 1, yPercent: 0, duration: 0.35, ease: 'power3.out' });
      gsap.to(links, { y: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: 'power3.out', delay: 0.15 });
    } else {
      gsap.set(mobileMenu, { opacity: 1, yPercent: 0 });
    }
  }

  function closeMenu() {
    isOpen = false;
    newBtn.textContent = '[ MENU ]';
    if (isMotionEnabled()) {
      gsap.to(mobileMenu, {
        opacity: 0, yPercent: -8, duration: 0.25, ease: 'power2.in',
        onComplete: () => gsap.set(mobileMenu, { display: 'none' })
      });
    } else {
      gsap.set(mobileMenu, { display: 'none', opacity: 0 });
    }
  }

  newBtn.addEventListener('click', () => isOpen ? closeMenu() : openMenu());

  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}
