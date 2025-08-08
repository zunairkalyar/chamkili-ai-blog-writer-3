
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#C57F5D',
        'brand-secondary': '#D18F70',
        'brand-bg': '#FFFBF5',
        'brand-text-dark': '#3D2C21',
        'brand-text-light': '#4b5563',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
