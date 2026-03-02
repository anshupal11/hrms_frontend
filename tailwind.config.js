/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Instrument Sans', 'Helvetica Neue', 'sans-serif'],
        serif:   ['Instrument Serif', 'Georgia', 'serif'],
        mono:    ['IBM Plex Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
