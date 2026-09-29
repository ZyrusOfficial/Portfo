# Prince Zyrus Natividad - Systems Architecture Portfolio

A high-performance, statically generated portfolio built with Vite, Vanilla JavaScript, Tailwind CSS, GSAP, and Lenis.

## Architecture

- **Framework:** Vanilla JavaScript with Vite for fast HMR and optimized builds.
- **Styling:** Tailwind CSS (v3) configured strictly to the provided design tokens.
- **Motion:** GSAP ScrollTrigger for hardware-accelerated transform reveals, synchronized with Lenis for smooth scrolling. 
- **Content Hydration:** The site uses `src/features/hydrate.js` to dynamically inject complex arrays (like the Editorial columns) and conditional logic (like the `READ` links) from `src/content/site.json`, ensuring text is editable in a single place.

## Folder Structure

```
├── src/
│   ├── content/
│   │   └── site.json         # Single source of truth for dynamic text content
│   ├── features/
│   │   └── hydrate.js        # Hydration logic mapping site.json to the DOM
│   ├── motion/
│   │   └── animations.js     # GSAP and Lenis initialization
│   ├── styles/
│   │   └── main.css          # Tailwind imports and custom static CSS
│   └── main.js               # Entry point linking all modules
├── index.html                # Main HTML structure and static layout
├── tailwind.config.js        # Design token configuration
└── vite.config.js            # Vite configuration (if any)
```

## Setup & Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## Environment Variables

- `VITE_FORM_ENDPOINT`: (Optional) Form submission endpoint URL. If omitted, the contact form automatically falls back to generating a `mailto:` link using `princezyrusnatividad@gmail.com`.

## Performance Notes

This architecture uses native DOM manipulation instead of a Virtual DOM, heavily optimizing for mobile performance and Lighthouse scores. Animations only target `transform`, `opacity`, `clip-path`, and `stroke-dashoffset` to ensure they run on the GPU compositor thread without triggering layout thrashing.
