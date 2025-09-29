/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3B82F6',
        },
      },
      boxShadow: {
        card: '0 10px 20px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl: '14px',
      }
    },
  },
  plugins: [],
}
