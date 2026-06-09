/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: '#3B6D11',
        'brand-dark': '#2D5509',
        cream: '#F7F4EE',
      },
    },
  },
  plugins: [],
};
