/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mindbody: '#E31C5F',
        gold: {
          light: '#F5E6CA',
          DEFAULT: '#D4AF37',
          dark: '#B8860B',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      scale: {
        '98': '0.98',
      }
    },
  },
  plugins: [],
}
