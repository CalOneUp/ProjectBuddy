/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#111827',        // Dark Background
        'brand-surface': '#1f2937',     // Lighter Surface
        'brand-primary': '#8b5cf6',      // Expressive Purple
        'brand-secondary': '#ec4899',   // Vibrant Pink
        'brand-tertiary': '#f59e0b',     // Warm Amber
        'brand-light': '#9ca3af',        // Muted Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
