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
        darkBg: '#0b0f19',
        darkCard: 'rgba(17, 24, 39, 0.75)',
        darkBorder: 'rgba(51, 65, 85, 0.4)',
        darkBorderHover: 'rgba(99, 102, 241, 0.4)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        subtle: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px -5px rgba(99, 102, 241, 0.25)',
      }
    },
  },
  plugins: [],
}
