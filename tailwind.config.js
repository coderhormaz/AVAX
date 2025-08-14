/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        avalanche: {
          red: '#E84142',
          blue: '#0071CE',
          gray: '#F3F4F6'
        }
      }
    },
  },
  plugins: [],
}
