/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#4f46e5', // indigo-600
        },
        slate: {
          50: '#f8fafc',
          800: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}