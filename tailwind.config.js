/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4a76fd',
          dark: '#3a66dd',
        },
        secondary: '#6c5ce7',
        accent: '#00d2d3',
        success: '#00b894',
        warning: '#fdcb6e',
        danger: '#ff7675',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        green: {
          500: '#22c55e',
        },
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
      },
      maxWidth: {
        '6xl': '72rem',
        'max': 'max-content',
        '80%': '80%',
      },
      width: {
        '80': '20rem',
        '12': '3rem',
        '10': '2.5rem',
        '8': '2rem',
        '5': '1.25rem',
        '3': '0.75rem',
        '2': '0.5rem',
      },
      height: {
        '90vh': '90vh',
        '12': '3rem',
        '10': '2.5rem',
        '8': '2rem',
        '5': '1.25rem',
        '3': '0.75rem',
        '2': '0.5rem',
      },
      maxHeight: {
        '800px': '800px',
      },
      borderRadius: {
        'xl': '0.75rem',
        'lg': '0.5rem',
        'md': '0.375rem',
        'sm': '0.125rem',
        'full': '9999px',
      },
      boxShadow: {
        'app': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
      },
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
        'transform': 'transform',
        'all': 'all',
      },
      transformOrigin: {
        'full': '0 0',
      },
      translate: {
        'full': '100%',
      },
      zIndex: {
        '10': '10',
        '30': '30',
      },
      inset: {
        '0': '0',
        'y-0': '0',
        'x-0': '0',
      },
    },
  },
  plugins: [],
} 