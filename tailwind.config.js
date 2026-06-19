/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        portfolio: {
          black: '#000000',
          card: '#0f0f0f',
          elevated: '#1a1a1a',
          border: '#2a2a2a',
          muted: '#3a3a3a',
          gray: '#888888',
          light: '#cccccc',
          white: '#ffffff',
        },
        metric: {
          cash: '#00FFAA',
          expense: '#FFD700',
          debt: '#FF1744',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 20px rgba(0, 0, 0, 0.6)',
        nav: '0 -4px 24px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
