/**
 * process-portrait.mjs
 * Processes the owner's portrait into all responsive variants.
 * Run: node scripts/process-portrait.mjs
 *
 * Outputs:
 *   public/img/portrait/portrait-480.avif/.webp/.jpg
 *   public/img/portrait/portrait-800.avif/.webp/.jpg
 *   public/img/portrait/portrait-1200.avif/.webp/.jpg
 *   public/img/portrait/portrait-72.jpg   (resume header square)
 *   public/img/portrait/portrait-512.png  (favicon 512)
 *   public/img/portrait/portrait-180.png  (apple-touch-icon 180)
 *   public/img/portrait/portrait-32.png   (favicon 32)
 *   public/img/og-card.jpg               (Open Graph 1200x630)
 *   outputs base64 placeholder to stdout
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'assets-src', 'portrait-original.jpg');
const PORTRAIT_OUT = join(ROOT, 'public', 'img', 'portrait');
const IMG_OUT = join(ROOT, 'public', 'img');

mkdirSync(PORTRAIT_OUT, { recursive: true });
mkdirSync(IMG_OUT, { recursive: true });

// Portrait image: 1080x1080 square (Gemini generated)
// Face centered horizontally, upper ~55% of frame
// For a 4:5 aspect-ratio display (portrait mode), we'll use the full width
// and let object-position handle focal point. No crop needed for the main portrait.
// Face center is approximately at y=40% of 1080px = 432px from top.

console.log('Processing portrait variants...');

// --- Base pipeline (auto-orient from EXIF, strip all metadata) ---
// .rotate() with no args = auto-orient from EXIF, then strips EXIF orientation tag
// withMetadata(false) is the default — all EXIF/GPS/XMP stripped

const base = () => sharp(SRC).rotate(); // auto-orient, no retouch

// --- Responsive variants ---
const widths = [480, 800, 1200];

for (const w of widths) {
  // AVIF
  await base()
    .resize(w, null, { withoutEnlargement: true })
    .avif({ quality: 72, effort: 6 })
    .toFile(join(PORTRAIT_OUT, `portrait-${w}.avif`));
  console.log(`  ✓ portrait-${w}.avif`);

  // WebP
  await base()
    .resize(w, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(join(PORTRAIT_OUT, `portrait-${w}.webp`));
  console.log(`  ✓ portrait-${w}.webp`);

  // JPEG fallback
  await base()
    .resize(w, null, { withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(join(PORTRAIT_OUT, `portrait-${w}.jpg`));
  console.log(`  ✓ portrait-${w}.jpg`);
}

// --- 72px square crop for resume header ---
// Face is centered in original, tight square crop keeps face
await base()
  .resize(72, 72, { fit: 'cover', position: 'top' })
  .jpeg({ quality: 85, progressive: true })
  .toFile(join(PORTRAIT_OUT, `portrait-72.jpg`));
console.log('  ✓ portrait-72.jpg');

// --- Favicon crops ---
const faviconSizes = [512, 180, 32];
for (const sz of faviconSizes) {
  await base()
    .resize(sz, sz, { fit: 'cover', position: 'top' })
    .png()
    .toFile(join(PORTRAIT_OUT, `portrait-${sz}.png`));
  console.log(`  ✓ portrait-${sz}.png`);
}

// --- Open Graph card: 1200x630 ---
// Layout: #ECEAE4 background, portrait square on left, text area on right

// Step 1: Write portrait resize to temp file
const ogPortraitPath = join(PORTRAIT_OUT, '_og-portrait-tmp.png');
await base()
  .resize(560, 560, { fit: 'cover', position: 'top' })
  .png()
  .toFile(ogPortraitPath);

// Step 2: Build background with all SVG text/lines
const ogSvg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#ECEAE4"/>
  <rect x="34" y="34" width="562" height="562" fill="none" stroke="#D8D3C8" stroke-width="1"/>
  <line x1="630" y1="40" x2="630" y2="590" stroke="#D8D3C8" stroke-width="1"/>
  <text x="660" y="100" font-family="monospace" font-size="11" fill="#8A847C" letter-spacing="2">ZYRUS // SYSTEMS ARCHITECTURE</text>
  <line x1="660" y1="115" x2="1165" y2="115" stroke="#D8D3C8" stroke-width="1"/>
  <text x="660" y="200" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#1C1B1A">PRINCE ZYRUS</text>
  <text x="660" y="252" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#1C1B1A">NATIVIDAD</text>
  <text x="660" y="310" font-family="Arial, sans-serif" font-size="18" fill="#5C5854">Builder &amp; Opinion Editor</text>
  <line x1="660" y1="335" x2="1165" y2="335" stroke="#D8D3C8" stroke-width="1"/>
  <text x="660" y="378" font-family="monospace" font-size="13" fill="#9A5B32">[ ZYRUS // SYSTEMS ARCHITECTURE ]</text>
  <text x="660" y="416" font-family="monospace" font-size="12" fill="#8A847C">zyrus.dpdns.org</text>
  <circle cx="665" cy="508" r="5" fill="#3F6E4C"/>
  <text x="680" y="513" font-family="monospace" font-size="11" fill="#3F6E4C">ONLINE // TARLAC-PH</text>
  <line x1="34" y1="596" x2="1165" y2="596" stroke="#D8D3C8" stroke-width="1"/>
</svg>`);

// Step 3: Composite portrait PNG file onto bg SVG
await sharp(ogSvg)
  .composite([
    { input: ogPortraitPath, left: 35, top: 35 }
  ])
  .flatten({ background: { r: 236, g: 234, b: 228 } })
  .jpeg({ quality: 90, progressive: true })
  .toFile(join(IMG_OUT, 'og-card.jpg'));

// Clean up temp file
const { unlinkSync } = await import('fs');
try { unlinkSync(ogPortraitPath); } catch(e) {}
console.log('  ✓ og-card.jpg (1200×630)');

// --- Tiny blurred placeholder (inline base64) ---
const placeholderBuf = await base()
  .resize(20, 25, { fit: 'cover', position: 'top' })
  .blur(3)
  .jpeg({ quality: 40 })
  .toBuffer();

const placeholderBase64 = placeholderBuf.toString('base64');
const placeholderDataUrl = `data:image/jpeg;base64,${placeholderBase64}`;

// Write placeholder to a JS file for easy import
writeFileSync(
  join(ROOT, 'src', 'content', 'portrait-placeholder.js'),
  `// Auto-generated by scripts/process-portrait.mjs\n// Tiny blurred placeholder for portrait image (< 2KB)\nexport const portraitPlaceholder = "${placeholderDataUrl}";\n`
);
console.log(`  ✓ portrait-placeholder.js (${placeholderBase64.length} chars base64)`);

// --- Verify file sizes ---
console.log('\nFile size check:');
const { statSync } = await import('fs');
const filesToCheck = [
  join(PORTRAIT_OUT, 'portrait-800.avif'),
  join(PORTRAIT_OUT, 'portrait-800.webp'),
  join(PORTRAIT_OUT, 'portrait-800.jpg'),
];
for (const f of filesToCheck) {
  const kb = (statSync(f).size / 1024).toFixed(1);
  const flag = kb > 150 ? ' ⚠️  EXCEEDS 150KB' : ' ✓';
  console.log(`  ${f.split(/[\\/]/).pop()}: ${kb} KB${flag}`);
}

console.log('\n✅ All portrait variants generated successfully.');
console.log(`Placeholder data URL length: ${placeholderDataUrl.length} chars`);
if (placeholderDataUrl.length > 2700) {
  console.warn('⚠️  Placeholder may exceed 2KB when rendered — consider reducing quality');
}
