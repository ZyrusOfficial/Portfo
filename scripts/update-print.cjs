const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const sectionsToHide = ['masthead', 'hero', 'story', 'capabilities', 'work', 'writing', 'lab', 'journey', 'beyond', 'contact'];

// Header and footer
html = html.replace('<header id="masthead" class="', '<header id="masthead" class="no-print ');
html = html.replace('<footer class="', '<footer class="no-print ');

// Mobile drawer and status bar
html = html.replace('<div id="mobile-drawer" class="', '<div id="mobile-drawer" class="no-print ');
html = html.replace('<!-- 1. Top Status Bar -->\n  <div class="', '<!-- 1. Top Status Bar -->\n  <div class="no-print ');

// Sections
for (const id of sectionsToHide) {
    html = html.replace(`<section id="${id}" class="`, `<section id="${id}" class="no-print `);
}

// Resume section updates
html = html.replace('<section id="resume" class="py-20 sm:py-28 border-b border-hairline">', '<section id="resume" class="print-page print:py-0 print:border-none py-20 sm:py-28 border-b border-hairline">');
html = html.replace('<div class="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 sm:mb-12">', '<div class="no-print flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 sm:mb-12">');
html = html.replace('<div class="bg-[#FBF9F5] border border-hairline p-8 sm:p-12 shadow-sm font-sans max-w-4xl mx-auto">', '<div class="bg-[#FBF9F5] print:bg-white border border-hairline print:border-none print:shadow-none p-8 sm:p-12 print:p-0 shadow-sm font-sans max-w-4xl mx-auto print:max-w-none print:mx-0 print:w-full">');

fs.writeFileSync('index.html', html);
console.log('Modified index.html');
