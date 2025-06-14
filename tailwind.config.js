/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a202c',       // Very Dark Blue
        'brand-surface': '#2d3748',    // Dark Slate
        'brand-primary': '#06b6d4',     // Vibrant Teal
        'brand-light': '#64748b',       // Muted Blue/Slate
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
