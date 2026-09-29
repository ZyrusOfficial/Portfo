import './styles/main.css';

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

// Interactive Transmission Form Simulation
const form = document.querySelector('form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = document.getElementById('transmit-status');
    if (status) {
      status.classList.remove('hidden');
      setTimeout(() => {
        status.textContent = "PACKET ROUTED TO ARCHIVE QUEUE [OK]";
      }, 1200);
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
