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
          DEFAULT: '#2cbd69',
          dark: '#2E8B57',
          light: '#34C759',
        },
      },
    },
  },
  plugins: [],
}
