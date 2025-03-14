/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      },
      colors: {
        primary: {
          50: '#e6f1ff',
          100: '#bddaff',
          200: '#94c2ff',
          300: '#6aaaff',
          400: '#4093ff',
          500: '#1a7bff',
          600: '#0062e6',
          700: '#004ab3',
          800: '#003380',
          900: '#001c4d',
        },
      },
    },
  },
  plugins: [],
} 