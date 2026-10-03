const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  '<span class="hidden sm:inline">TIME:',
  '<button onclick="toggleMotion()" class="hover:text-terracotta transition-colors">[ MOTION: <span id="motion-state">ON</span> ]</button> <span class="hidden sm:inline">TIME:'
);

html = html.replace(
  '</body>',
  `<script type="module">
    import { isMotionEnabled } from "/src/motion/config.js";
    const el = document.getElementById("motion-state");
    if(el) el.innerText = isMotionEnabled() ? "ON" : "OFF";
  </script>
  </body>`
);

// bg-transparent
html = html.replace(
  'id="hero" class="',
  'id="hero" class="bg-transparent '
);

fs.writeFileSync('index.html', html);
console.log('Modified index.html');
