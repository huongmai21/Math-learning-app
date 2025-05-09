/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6f61',
        secondary: '#2c3e50',
        light: '#f5f5f5',
        accent: '#ff9a8b',
      },
    },
  },
  plugins: [],
};