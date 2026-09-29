/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: '#ECEAE4',
        card: '#F5F3EC',
        inset: '#E2DED5',
        hairline: '#D8D3C8',
        'hairline-hover': '#BDB6A5',
        ink: '#1C1B1A',
        'ink-muted': '#5C5854',
        'ink-subtle': '#8A847C',
        terracotta: '#9A5B32',
        'terracotta-subtle': '#F4ECE6',
        'status-green': '#3F6E4C',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['Newsreader', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.12em',
      }
    },
  },
  plugins: [],
}
