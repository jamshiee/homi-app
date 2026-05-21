/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFC914',
          soft: '#FFD966',
          dark: '#1A1A1A',
          muted: '#555555',
          surface: '#F7F7F7',
          border: '#E5E7EB',
        },
      },
    },
  },
  plugins: [],
};
