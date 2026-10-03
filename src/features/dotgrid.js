import { getMotionConfig, isMotionEnabled } from '../motion/config.js';

export function initDotGrid() {
  const motionEnabled = isMotionEnabled();
  
  const canvas = document.createElement('canvas');
  canvas.id = 'dotgrid-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
  });
  document.body.prepend(canvas);

  if (!motionEnabled) {
    // Fallback: simple CSS background
    canvas.style.opacity = '0.06';
    canvas.style.backgroundImage = 'radial-gradient(#1C1B1A 1px, transparent 1px)';
    canvas.style.backgroundSize = '26px 26px';
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height, dpr;
  
  let isDesktop = window.matchMedia('(min-width: 1024px)').matches;
  let spacing = isDesktop ? 26 : 22;
  
  const config = getMotionConfig();
  const baseRadius = config.dotGridRadius.base;
  const hoverRadius = config.dotGridRadius.hover;
  const pushMax = 10;
  
  let cols, rows;
  let dotsX, dotsY, dotsBaseX, dotsBaseY, dotsVx, dotsVy, dotsOp, dotsCol;
  
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, active: false };
  let touches = new Map();
  let ripples = [];
  
  let scrollY = window.scrollY;
  let scrollVelocity = 0;
  
  let lastTime = performance.now();
  let inactivityTimer = 0;
  let isLooping = true;
  
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    spacing = isDesktop ? 26 : 22;
    
    cols = Math.ceil(width / spacing) + 1;
    rows = Math.ceil(height / spacing) + 1;
    const total = cols * rows;
    
    dotsX = new Float32Array(total);
    dotsY = new Float32Array(total);
    dotsBaseX = new Float32Array(total);
    dotsBaseY = new Float32Array(total);
    dotsVx = new Float32Array(total);
    dotsVy = new Float32Array(total);
    dotsOp = new Float32Array(total);
    dotsCol = new Float32Array(total); // 0 = ink, 1 = terracotta
    
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * spacing;
        const py = y * spacing;
        dotsBaseX[i] = px;
        dotsBaseY[i] = py;
        dotsX[i] = px;
        dotsY[i] = py;
        dotsOp[i] = isDesktop ? 0.05 : 0;
        i++;
      }
    }
    
    startLoop();
  }
  
  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }
  
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }
  
  function update(dt) {
    let active = false;
    
    // Update scroll
    const currentScroll = window.scrollY;
    const rawScrollVel = (currentScroll - scrollY) / (dt || 16.6);
    scrollVelocity = lerp(scrollVelocity, rawScrollVel, 0.1);
    scrollY = currentScroll;
    
    if (Math.abs(scrollVelocity) > 0.1) active = true;
    if (mouse.active) active = true;
    if (touches.size > 0) active = true;
    if (ripples.length > 0) active = true;
    
    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      let r = ripples[i];
      r.radius += (600 * dt) / 1000;
      r.age += dt;
      if (r.age > 1200) {
        ripples.splice(i, 1);
      } else {
        active = true;
      }
    }
    
    const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
    const dynamicRadius = isDesktop ? Math.min(170 * 1.5, 170 + mouseSpeed * 2) : 130;
    
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let bx = dotsBaseX[i];
        let by = dotsBaseY[i];
        
        let targetX = bx;
        let targetY = by;
        let targetOp = isDesktop ? 0.05 : 0;
        let targetCol = 0;
        let scaleMult = 1;
        
        // Scroll wave
        const wave = Math.sin(y * 0.5) * Math.min(Math.max(scrollVelocity * 2, -6), 6);
        targetY += wave;
        
        // Mouse interaction
        if (isDesktop && mouse.active) {
          const dx = bx - mouse.x;
          const dy = by - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < dynamicRadius) {
            const inf = 1 - (dist / dynamicRadius);
            const easeInf = easeOutCubic(inf);
            
            targetOp = Math.max(targetOp, lerp(0.05, 0.85, easeInf));
            targetCol = Math.max(targetCol, lerp(0, 0.7, easeInf));
            scaleMult = Math.max(scaleMult, lerp(1, hoverRadius / baseRadius, easeInf));
            
            // Push away
            const push = easeInf * pushMax;
            targetX += (dx / dist) * push;
            targetY += (dy / dist) * push;
          }
        }
        
        // Touch interaction
        touches.forEach(t => {
          const dx = bx - t.x;
          const dy = by - t.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const inf = 1 - (dist / 130);
            targetOp = Math.max(targetOp, inf * 0.8);
            targetCol = Math.max(targetCol, inf * 0.5);
            scaleMult = Math.max(scaleMult, 1 + inf * 1.5);
          }
        });
        
        // Ripples
        for (let r of ripples) {
          const dx = bx - r.x;
          const dy = by - r.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ringDist = Math.abs(dist - r.radius);
          if (ringDist < 45) { // 90px width / 2
            const inf = 1 - (ringDist / 45);
            const ageFade = 1 - (r.age / 1200);
            const intensity = inf * ageFade;
            
            targetOp = Math.max(targetOp, intensity);
            scaleMult = Math.max(scaleMult, 1 + intensity * 1.2); // max 2.2x
            
            if (dist > 0) {
              targetX += (dx / dist) * intensity * 14;
              targetY += (dy / dist) * intensity * 14;
            }
          }
        }
        
        // Spring physics for position
        const ax = (targetX - dotsX[i]) * 0.12;
        const ay = (targetY - dotsY[i]) * 0.12;
        dotsVx[i] = (dotsVx[i] + ax) * 0.82;
        dotsVy[i] = (dotsVy[i] + ay) * 0.82;
        dotsX[i] += dotsVx[i];
        dotsY[i] += dotsVy[i];
        
        if (Math.abs(dotsVx[i]) > 0.01 || Math.abs(dotsVy[i]) > 0.01) active = true;
        
        // Lerp opacity and color
        dotsOp[i] = lerp(dotsOp[i], targetOp, 0.1);
        dotsCol[i] = lerp(dotsCol[i], targetCol, 0.1);
        
        if (Math.abs(dotsOp[i] - targetOp) > 0.01) active = true;
        
        i++;
      }
    }
    
    if (active) inactivityTimer = 0;
    else inactivityTimer += dt;
    
    if (inactivityTimer > 1000) {
      isLooping = false;
    }
  }
  
  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const op = dotsOp[i];
        if (op > 0.01) {
          const r = isDesktop ? 28 : 28; // #1C1B1A
          const g = isDesktop ? 27 : 27;
          const b = isDesktop ? 26 : 26;
          
          const tr = 154; // #9A5B32
          const tg = 91;
          const tb = 50;
          
          const colAmt = dotsCol[i];
          const fr = Math.round(lerp(r, tr, colAmt));
          const fg = Math.round(lerp(g, tg, colAmt));
          const fb = Math.round(lerp(b, tb, colAmt));
          
          ctx.fillStyle = `rgba(${fr}, ${fg}, ${fb}, ${op})`;
          ctx.beginPath();
          // Approximate scale from opacity/color (reconstructing scaleMult)
          let currentScale = 1;
          if (colAmt > 0) currentScale = 1 + colAmt * ((hoverRadius/baseRadius)-1);
          // Just a simple size based on target scale in update
          ctx.arc(dotsX[i], dotsY[i], baseRadius * (1 + colAmt * 2.1), 0, Math.PI * 2);
          ctx.fill();
        }
        i++;
      }
    }
  }
  
  function loop(time) {
    if (!isLooping) return;
    const dt = time - lastTime;
    lastTime = time;
    
    update(dt);
    draw();
    
    requestAnimationFrame(loop);
  }
  
  function startLoop() {
    lastTime = performance.now();
    inactivityTimer = 0;
    if (!isLooping) {
      isLooping = true;
      requestAnimationFrame(loop);
    }
  }
  
  // Event listeners
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) isLooping = false;
    else startLoop();
  });
  
  window.addEventListener('mousemove', (e) => {
    mouse.vx = e.clientX - mouse.x;
    mouse.vy = e.clientY - mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    startLoop();
  }, { passive: true });
  
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    startLoop();
  });
  
  window.addEventListener('touchstart', (e) => {
    for (let i=0; i<e.changedTouches.length; i++) {
      let t = e.changedTouches[i];
      touches.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
    startLoop();
  }, { passive: true });
  
  window.addEventListener('touchmove', (e) => {
    for (let i=0; i<e.changedTouches.length; i++) {
      let t = e.changedTouches[i];
      if (touches.has(t.identifier)) {
        touches.get(t.identifier).x = t.clientX;
        touches.get(t.identifier).y = t.clientY;
      }
    }
    startLoop();
  }, { passive: true });
  
  window.addEventListener('touchend', (e) => {
    for (let i=0; i<e.changedTouches.length; i++) {
      touches.delete(e.changedTouches[i].identifier);
    }
    startLoop();
  }, { passive: true });
  
  window.addEventListener('scroll', () => {
    startLoop();
  }, { passive: true });
  
  window.addEventListener('click', (e) => {
    if (ripples.length >= 6) ripples.shift();
    ripples.push({ x: e.clientX, y: e.clientY, radius: 0, age: 0 });
    startLoop();
  }, { passive: true });
  
  resize();
}
