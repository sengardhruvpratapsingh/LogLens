/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B1220',
          secondary: '#111B2E',
          card: '#172337',
          border: '#1E2D4A',
          hover: '#1D2D47',
        },
        brand: {
          primary: '#22D3EE',
          secondary: '#38BDF8',
          accent: '#06B6D4',
        },
        severity: {
          critical: '#DC2626',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
          debug: '#8B5CF6',
          unknown: '#64748B',
        },
      },
    },
  },
  plugins: [],
}
