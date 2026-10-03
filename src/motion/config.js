export const PRESETS = {
  calm: {
    multiplier: 0.5,
    revealOffset: 30,
    heroOffset: 60,
    durations: { fast: 0.4, base: 0.7, slow: 1.0, counter: 1.5, intro: 1.5 },
    stagger: 0.08,
    parallax: { bg: 70, mid: 45, content: 20 },
    hoverLift: 5,
    magneticRange: 60,
    pullStrength: 0.2,
    tiltAngle: 2,
    marqueeSpeed: 0.5,
    dotGridRadius: { base: 1.1, hover: 2.2 }
  },
  expressive: {
    multiplier: 1.0,
    revealOffset: 68,     // 56-80px
    heroOffset: 120,
    durations: { fast: 0.5, base: 1.0, slow: 1.4, counter: 2.2, intro: 2.4 }, // durations 900-1400ms
    stagger: 0.13,        // 110-160ms
    parallax: { bg: 140, mid: 90, content: 40 },
    hoverLift: 10,
    magneticRange: 110,
    pullStrength: 0.4,
    tiltAngle: 5,
    marqueeSpeed: 1.0,
    dotGridRadius: { base: 1.1, hover: 3.4 }
  },
  bold: {
    multiplier: 1.5,
    revealOffset: 120,
    heroOffset: 180,
    durations: { fast: 0.7, base: 1.4, slow: 2.0, counter: 3.0, intro: 3.2 },
    stagger: 0.2,
    parallax: { bg: 210, mid: 135, content: 60 },
    hoverLift: 15,
    magneticRange: 160,
    pullStrength: 0.6,
    tiltAngle: 8,
    marqueeSpeed: 2.0,
    dotGridRadius: { base: 1.1, hover: 4.8 }
  }
};

export const INTENSITY = 'expressive';

export const getMotionConfig = () => PRESETS[INTENSITY];

export const isMotionEnabled = () => {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem('motion-toggle');
    if (stored !== null) {
      return stored === 'on';
    }
  } catch (e) {
    console.warn('localStorage not accessible', e);
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const setMotionEnabled = (enabled) => {
  try {
    localStorage.setItem('motion-toggle', enabled ? 'on' : 'off');
    window.location.reload(); // Reload to apply cleanly
  } catch (e) {
    console.warn('localStorage not accessible', e);
  }
};
