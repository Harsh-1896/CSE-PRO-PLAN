/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#c7e0ff',
          300: '#9bc8ff',
          400: '#64a5ff',
          500: '#1a62ea', // SMART-PRO template primary blue
          600: '#1350c7',
          700: '#0f3fa5',
          800: '#113686',
          900: '#13306f',
          950: '#0b1d45'
        },
        surface: {
          ground: '#f4f7fe',
          card: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}

