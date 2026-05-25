/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:  { DEFAULT: '#050816', 2: '#0A0F1E', 3: '#0F1628', 4: '#1A2340' },
        gold: { DEFAULT: '#C8A96E', light: '#E8C87A', dim: '#8B6E2A' },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
