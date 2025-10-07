/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        accent: '#3b82f6',
        success: '#10b981',
      },
    },
  },
  plugins: [],
}
