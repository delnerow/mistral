/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        case: {
          slate: '#0f172a',
          ink: '#0b1220',
          premium: '#d97706',
          danger: '#ef4444',
          success: '#10b981',
          info: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
};
