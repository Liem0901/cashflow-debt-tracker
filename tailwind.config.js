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
          debt: '#FF4569',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 20px rgba(0, 0, 0, 0.6)',
        nav: '0 8px 32px rgba(0, 0, 0, 0.55)',
        'glow-ai': '0 0 24px rgba(168, 85, 247, 0.45)',
        'glow-fab': '0 8px 28px rgba(255, 255, 255, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'coin-shine': 'coinShine 2.8s ease-in-out infinite',
        'jar-wave': 'jarWave 4s linear infinite',
        'jar-wave-slow': 'jarWave 7s linear infinite reverse',
        'jar-bubble': 'jarBubble 3.5s ease-in-out infinite',
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
        coinShine: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '55%': { transform: 'translateX(220%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' },
        },
        jarWave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        jarBubble: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.45' },
          '70%': { opacity: '0.25' },
          '100%': { transform: 'translateY(-28px) scale(0.85)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
