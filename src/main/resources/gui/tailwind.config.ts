import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        surface: '#111111',
        'surface-2': '#1a1a1a',
        'text-muted': '#6b7280',
      },
      fontFamily: {
        satoshi: ['Satoshi', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(255, 215, 0, 0.3)',
        'gold-sm': '0 0 10px rgba(255, 215, 0, 0.2)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,215,0,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(255,215,0,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
