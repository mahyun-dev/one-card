/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f0ff',
          purple: '#b800e6',
          pink: '#ff00ff',
          green: '#00ff88',
          yellow: '#ffff00',
        },
      },
      animation: {
        'card-draw': 'card-draw 0.5s ease-out',
        'card-play': 'card-play 0.3s ease-in-out',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'card-draw': {
          '0%': { transform: 'translateY(-100px) rotate(-20deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        'card-play': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-30px) scale(1.1)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 5px currentColor)' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 20px currentColor)' },
        },
      },
    },
  },
  plugins: [],
}
