const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add data-decode to folio labels like "[ 01 / STORY ]", "[ 02 / CAPABILITIES ]" etc.
html = html.replace(/(<span class="font-mono text-xs uppercase tracking-widest text-terracotta">)(\[ \d\d \/ [A-Z &amp;]+ \])/g, '$1<span data-decode aria-label="$2">$2</span>');

// 2. Add tilt-card class to bento cards
html = html.replace(/<div class="bento-card bg-card border border-hairline p-6 flex flex-col justify-between">/g,
  '<div class="bento-card tilt-card bg-card border border-hairline p-6 flex flex-col justify-between">');

// 3. Add tilt-card to work dossier article cards  
html = html.replace(/<article class="bg-card border border-hairline p-6 sm:p-10 shadow-sm relative">/g,
  '<article class="bg-card border border-hairline p-6 sm:p-10 shadow-sm relative tilt-card">');

// 4. Mark the three main dossier articles with data-pinned-story (first 3 articles in #work section)
// Mark PROBLEM, ACTION, RESULT blocks with data-story-* attributes
html = html.replace(/<div class="p-4 bg-inset border-l-2 border-terracotta text-sm font-sans text-ink-muted">/g,
  '<div class="p-4 bg-inset border-l-2 border-terracotta text-sm font-sans text-ink-muted" data-story-problem>');
html = html.replace(/<div class="text-sm sm:text-base font-sans text-ink-muted leading-relaxed">\s*<strong class="font-mono text-xs text-ink block uppercase tracking-wider mb-1">\[ ACTION \]/g,
  '<div class="text-sm sm:text-base font-sans text-ink-muted leading-relaxed" data-story-action>\n                <strong class="font-mono text-xs text-ink block uppercase tracking-wider mb-1">[ ACTION ]');
html = html.replace(/<div class="text-sm sm:text-base font-sans text-ink-muted leading-relaxed">\s*<strong class="font-mono text-xs text-status-green block uppercase tracking-wider mb-1">\[ RESULT \]/g,
  '<div class="text-sm sm:text-base font-sans text-ink-muted leading-relaxed" data-story-result>\n                <strong class="font-mono text-xs text-status-green block uppercase tracking-wider mb-1">[ RESULT ]');

fs.writeFileSync('index.html', html);
console.log('HTML patched for signature effects');
