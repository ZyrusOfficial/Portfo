import './styles/main.css';
import { hydrateContent } from './features/hydrate.js';
import { initMotion } from './motion/animations.js';
import { initDotGrid } from './features/dotgrid.js';
import { isMotionEnabled, setMotionEnabled } from './motion/config.js';
import {
  initGhostNumerals,
  initTextDecode,
  initMarquee,
  initPinnedStory,
  initTilt,
  initClickRipple,
  initSectionScanner,
  initMobileMenu,
} from './features/signature-effects.js';

import printJS from 'print-js';

// Hydrate dynamic data
hydrateContent();

// Initialize GSAP & Lenis
initMotion();

// Initialize Interactive Dot Grid
initDotGrid();

// Initialize Signature Effects (Step 3)
initGhostNumerals();
initTextDecode();
initMarquee();
initPinnedStory();
initTilt();
initClickRipple();
initSectionScanner();
initMobileMenu();

// Motion Toggle Logic
window.toggleMotion = function() {
  setMotionEnabled(!isMotionEnabled());
};

// Expose print functionality for the PDF dossier
window.printDossier = function(e) {
  if (e) e.preventDefault();
  printJS('/assets/Prince-Zyrus-Natividad-Resume.pdf');
};


// Live Telemetry Clock (PHT)
function updateClock() {
  const now = new Date();
  const el = document.getElementById('telemetry-time');
  if (el) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    el.textContent = formatter.format(now) + ' PHT (UTC+8)';
  }
}
setInterval(updateClock, 1000);
updateClock();

// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
function toggleMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}
if (mobileBtn) {
  mobileBtn.addEventListener('click', toggleMobileMenu);
}
// Also attach to the links inside mobile menu
const mobileLinks = document.querySelectorAll('#mobile-menu a');
mobileLinks.forEach(link => {
  link.addEventListener('click', toggleMobileMenu);
});

// Email Obfuscation
const emailEl = document.getElementById('contact-email');
if (emailEl) {
  const user = 'princezyrusnatividad';
  const domain = 'gmail.com';
  const addr = `${user}@${domain}`;
  emailEl.innerHTML = `<a href="mailto:${addr}" class="hover:text-terracotta hover:underline">${addr}</a>`;
}

// Interactive Transmission Form Handling
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('transmit-status');
    const error = document.getElementById('transmit-error');
    const submitBtn = document.getElementById('form-submit');
    const honey = document.getElementById('honey').value;

    status.classList.add('hidden');
    error.classList.add('hidden');

    if (honey) {
      return; // Honeypot triggered
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>[ TRANSMITTING... ]</span>`;

    const endpoint = import.meta.env.VITE_FORM_ENDPOINT;
    
    if (!endpoint) {
      // Fallback to mailto
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;
      
      const mailto = `mailto:princezyrusnatividad@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
      window.location.href = mailto;
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>[ TRANSMIT PACKET ]</span>`;
      status.classList.remove('hidden');
      return;
    }

    try {
      const formData = new FormData(form);
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        status.classList.remove('hidden');
        form.reset();
      } else {
        error.classList.remove('hidden');
      }
    } catch (err) {
      error.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>[ TRANSMIT PACKET ]</span>`;
    }
  });
}

// Custom Cursor tracking (Desktop)
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  }
});

function renderCursor() {
  ringX += (mouseX - ringX) * 0.15;
  ringY += (mouseY - ringY) * 0.15;
  if (cursorRing) {
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
  }
  requestAnimationFrame(renderCursor);
}
renderCursor();

// Hover state on links & interactive elements
const interactiveElements = document.querySelectorAll('a, button, input, select, textarea');
interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// Stat Count-Up Animation via IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      if (target > 0) {
        let count = 0;
        const step = Math.max(1, Math.floor(target / 20));
        const timer = setInterval(() => {
          count += step;
          if (count >= target) {
            el.textContent = target;
            clearInterval(timer);
          } else {
            el.textContent = count;
          }
        }, 60);
      }
      observer.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count-up').forEach(el => observer.observe(el));
