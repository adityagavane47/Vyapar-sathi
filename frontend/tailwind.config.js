/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#08080a',
        darkCard: 'rgba(20, 20, 25, 0.65)',
        darkBorder: 'rgba(63, 63, 70, 0.3)',
        darkBorderHover: 'rgba(249, 115, 22, 0.3)',
        brandOrange: '#f97316',
        brandRed: '#ef4444',
        brandGreen: '#10b981',
        brandBlue: '#3b82f6',
        brandMuted: '#71717a',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 15px rgba(249, 115, 22, 0.15)',
        glowGreen: '0 0 15px rgba(16, 185, 129, 0.15)',
        glowRed: '0 0 15px rgba(239, 68, 68, 0.15)',
      }
    },
  },
  plugins: [],
}
