import { getMotionConfig, isMotionEnabled } from '../motion/config.js';

export function initDotGrid() {
  const motionEnabled = isMotionEnabled();

  const canvas = document.createElement('canvas');
  canvas.id = 'dotgrid-canvas';
  // Use absolute positioning inside body (which gets position:relative in CSS)
  // so the canvas never escapes the document or overlaps browser chrome.
  // z-index:-1 keeps it firmly behind all page content.
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '-1',           // FIX 1: behind ALL content, never leaks
    pointerEvents: 'none',
  });
  document.body.prepend(canvas);

  if (!motionEnabled) {
    // Static dot texture fallback via CSS only (no canvas drawing)
    canvas.style.display = 'none';
    document.body.style.backgroundImage =
      'radial-gradient(circle, rgba(28,27,26,0.07) 1px, transparent 1px)';
    document.body.style.backgroundSize = '26px 26px';
    return;
  }

  // ── State ──────────────────────────────────────────────
  const config = getMotionConfig();
  const baseRadius = config.dotGridRadius.base;
  const hoverRadius = config.dotGridRadius.hover;
  const pushMax = 10;

  let ctx = canvas.getContext('2d', { alpha: true });
  let width = 0, height = 0, dpr = 1;
  let isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  let spacing = isDesktop ? 26 : 22;

  let cols = 0, rows = 0;
  let dotsX, dotsY, dotsBaseX, dotsBaseY, dotsVx, dotsVy, dotsOp, dotsCol;

  let mouse = { x: -9999, y: -9999, vx: 0, vy: 0, active: false };
  let touches = new Map();
  let ripples = [];
  let scrollYCache = window.scrollY;
  let scrollVelocity = 0;

  // Loop control — use a generation counter to kill stale loops cleanly
  let loopGeneration = 0;
  let isLooping = false;
  let lastTime = 0;
  let inactivityTimer = 0;

  // ── Resize ─────────────────────────────────────────────
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width  = window.innerWidth;
    height = window.innerHeight;

    // FIX 2: Reset canvas dimensions then get a FRESH context transform.
    // Setting .width clears the canvas AND resets all transforms.
    canvas.width  = Math.round(width  * dpr);
    canvas.height = Math.round(height * dpr);
    // Re-fetch context reference after resize (some browsers invalidate it)
    ctx = canvas.getContext('2d', { alpha: true });
    ctx.scale(dpr, dpr);   // Applied exactly once per resize

    isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    spacing = isDesktop ? 26 : 22;

    cols = Math.ceil(width  / spacing) + 2;
    rows = Math.ceil(height / spacing) + 2;
    const total = cols * rows;

    // Allocate fresh typed arrays (loop reads these by closure, so swap atomically)
    const _dotsX    = new Float32Array(total);
    const _dotsY    = new Float32Array(total);
    const _dotsBaseX= new Float32Array(total);
    const _dotsBaseY= new Float32Array(total);
    const _dotsVx   = new Float32Array(total);
    const _dotsVy   = new Float32Array(total);
    const _dotsOp   = new Float32Array(total);
    const _dotsCol  = new Float32Array(total);

    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * spacing;
        const py = y * spacing;
        _dotsBaseX[i] = px; _dotsX[i] = px;
        _dotsBaseY[i] = py; _dotsY[i] = py;
        _dotsOp[i] = isDesktop ? 0.05 : 0;
        i++;
      }
    }

    // FIX 3: Stop current loop generation, then swap arrays, then restart
    loopGeneration++;
    dotsX = _dotsX; dotsY = _dotsY;
    dotsBaseX = _dotsBaseX; dotsBaseY = _dotsBaseY;
    dotsVx = _dotsVx; dotsVy = _dotsVy;
    dotsOp = _dotsOp; dotsCol = _dotsCol;

    startLoop();
  }

  // ── Helpers ────────────────────────────────────────────
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = x => 1 - Math.pow(1 - x, 3);

  // ── Update ─────────────────────────────────────────────
  function update(dt) {
    // FIX 4: Cap dt to avoid explosion after tab resume or slow frame
    const safeDt = Math.min(dt, 50);

    let active = false;

    const currentScroll = window.scrollY;
    const rawVel = (currentScroll - scrollYCache) / (safeDt || 16.6);
    scrollVelocity = lerp(scrollVelocity, rawVel, 0.12);
    scrollYCache = currentScroll;

    if (Math.abs(scrollVelocity) > 0.08) active = true;
    if (mouse.active) active = true;
    if (touches.size > 0) active = true;
    if (ripples.length > 0) active = true;

    // Ripples age
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += (600 * safeDt) / 1000;
      r.age    += safeDt;
      if (r.age > 1200) ripples.splice(i, 1);
      else active = true;
    }

    const mouseSpeed = Math.hypot(mouse.vx, mouse.vy);
    const dynamicRadius = isDesktop
      ? Math.min(255, 170 + mouseSpeed * 1.5)
      : 130;

    const total = cols * rows;
    for (let i = 0; i < total; i++) {
      const bx = dotsBaseX[i];
      const by = dotsBaseY[i];

      let targetX  = bx;
      let targetY  = by;
      let targetOp = isDesktop ? 0.05 : 0;
      let targetCol = 0;

      // Scroll wave displacement
      const rowIdx = Math.floor(i / cols);
      const wave = Math.sin(rowIdx * 0.5) *
        Math.max(-6, Math.min(6, scrollVelocity * 2));
      targetY += wave;

      // Mouse influence (desktop only)
      if (isDesktop && mouse.active) {
        const dx = bx - mouse.x;
        const dy = by - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < dynamicRadius && dist > 0) {
          const inf     = 1 - dist / dynamicRadius;
          const eased   = easeOutCubic(inf);
          targetOp  = Math.max(targetOp,  lerp(0.05, 0.85, eased));
          targetCol = Math.max(targetCol, lerp(0,    0.70, eased));
          const push = eased * pushMax;
          targetX += (dx / dist) * push;
          targetY += (dy / dist) * push;
        }
      }

      // Touch influence
      touches.forEach(t => {
        const dx   = bx - t.x;
        const dy   = by - t.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const inf = 1 - dist / 130;
          targetOp  = Math.max(targetOp,  inf * 0.80);
          targetCol = Math.max(targetCol, inf * 0.50);
        }
      });

      // Ripple rings
      for (const r of ripples) {
        const dx      = bx - r.x;
        const dy      = by - r.y;
        const dist    = Math.hypot(dx, dy);
        const ringDist= Math.abs(dist - r.radius);
        if (ringDist < 45) {
          const inf      = 1 - ringDist / 45;
          const ageFade  = 1 - r.age / 1200;
          const intensity= inf * ageFade;
          targetOp = Math.max(targetOp, intensity * 0.9);
          if (dist > 0) {
            targetX += (dx / dist) * intensity * 14;
            targetY += (dy / dist) * intensity * 14;
          }
        }
      }

      // Spring physics
      const ax = (targetX - dotsX[i]) * 0.12;
      const ay = (targetY - dotsY[i]) * 0.12;
      dotsVx[i] = (dotsVx[i] + ax) * 0.82;
      dotsVy[i] = (dotsVy[i] + ay) * 0.82;
      dotsX[i] += dotsVx[i];
      dotsY[i] += dotsVy[i];

      if (Math.abs(dotsVx[i]) > 0.01 || Math.abs(dotsVy[i]) > 0.01) active = true;

      dotsOp[i]  = lerp(dotsOp[i],  targetOp,  0.10);
      dotsCol[i] = lerp(dotsCol[i], targetCol, 0.10);
      if (Math.abs(dotsOp[i] - targetOp) > 0.01) active = true;
    }

    if (active) inactivityTimer = 0;
    else        inactivityTimer += safeDt;

    return active || inactivityTimer < 1200;
  }

  // ── Draw ───────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const total = cols * rows;
    for (let i = 0; i < total; i++) {
      const op = dotsOp[i];
      if (op < 0.012) continue;

      const col = dotsCol[i];
      // Ink #1C1B1A → Terracotta #9A5B32
      const fr = Math.round(28  + col * (154 - 28));
      const fg = Math.round(27  + col * (91  - 27));
      const fb = Math.round(26  + col * (50  - 26));

      ctx.fillStyle = `rgba(${fr},${fg},${fb},${op.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(
        dotsX[i], dotsY[i],
        baseRadius * (1 + col * ((hoverRadius / baseRadius) - 1)),
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  // ── Loop ───────────────────────────────────────────────
  function loop(gen, time) {
    if (gen !== loopGeneration || !isLooping) return; // stale or stopped
    const dt = lastTime ? time - lastTime : 16;
    lastTime = time;

    const keepGoing = update(dt);
    draw();

    if (!keepGoing) {
      isLooping = false;
      return;
    }
    requestAnimationFrame(t => loop(gen, t));
  }

  function startLoop() {
    inactivityTimer = 0;
    if (isLooping) return; // already running, just reset inactivity timer
    isLooping = true;
    lastTime  = 0; // FIX 5: zero so first frame gets safe dt=16 fallback
    const gen = ++loopGeneration;
    requestAnimationFrame(t => loop(gen, t));
  }

  // ── Events ─────────────────────────────────────────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isLooping = false;
      loopGeneration++; // kill current loop
    } else {
      startLoop();
    }
  });

  window.addEventListener('mousemove', e => {
    mouse.vx = e.clientX - (mouse.active ? mouse.x : e.clientX);
    mouse.vy = e.clientY - (mouse.active ? mouse.y : e.clientY);
    mouse.x  = e.clientX;
    mouse.y  = e.clientY;
    mouse.active = true;
    startLoop();
  }, { passive: true });

  // FIX 6: Also reset on mouseleave from the DOCUMENT (not window)
  document.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.vx = 0;
    mouse.vy = 0;
  });

  window.addEventListener('touchstart', e => {
    for (const t of e.changedTouches)
      touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    startLoop();
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (touches.has(t.identifier))
        touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
    startLoop();
  }, { passive: true });

  window.addEventListener('touchend', e => {
    for (const t of e.changedTouches) touches.delete(t.identifier);
    // Keep loop alive briefly so dots fade out
    startLoop();
  }, { passive: true });

  window.addEventListener('touchcancel', e => {
    for (const t of e.changedTouches) touches.delete(t.identifier);
  }, { passive: true });

  window.addEventListener('scroll', () => startLoop(), { passive: true });

  // Dot-grid ripples on click (separate from button ripple in signature-effects)
  window.addEventListener('click', e => {
    if (ripples.length >= 6) ripples.shift();
    ripples.push({ x: e.clientX, y: e.clientY, radius: 0, age: 0 });
    startLoop();
  }, { passive: true });

  resize();
}
